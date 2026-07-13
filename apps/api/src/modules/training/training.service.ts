import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { CoachingService } from '../coaching/coaching.service';
import type { CreateExerciseDto } from './dto/create-exercise.dto';
import type { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import type { CreateWorkoutSessionDto } from './dto/create-workout-session.dto';
import type { PrescribeWorkoutPlanDto } from './dto/prescribe-workout-plan.dto';
import type {
  CreateWorkoutTemplateDto,
  TemplateExerciseItemDto,
  UpdateWorkoutTemplateDto,
} from './dto/workout-template.dto';
import {
  TRAINING_SESSION_COMPLETED,
  type TrainingSessionCompletedEvent,
} from './events/training.events';

@Injectable()
export class TrainingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => CoachingService))
    private readonly coachingService: CoachingService,
  ) {}

  async createExercise(userId: string, dto: CreateExerciseDto) {
    return this.prisma.trainingExercise.create({
      data: {
        userId,
        name: dto.name,
        muscleGroup: dto.muscleGroup,
        equipment: dto.equipment,
      },
    });
  }

  async listExercises(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.trainingExercise.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.trainingExercise.count({ where: { userId } }),
    ]);

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async createWorkoutPlan(userId: string, dto: CreateWorkoutPlanDto) {
    const exerciseIds = dto.items.map((item) => item.exerciseId);
    const exercises = await this.prisma.trainingExercise.findMany({
      where: { id: { in: exerciseIds }, userId },
    });

    if (exercises.length !== exerciseIds.length) {
      throw new BadRequestException('errors.invalid_exercise_reference');
    }

    return this.prisma.trainingWorkoutPlan.create({
      data: {
        userId,
        name: dto.name,
        items: {
          create: dto.items.map((item, index) => ({
            exerciseId: item.exerciseId,
            sets: item.sets,
            reps: item.reps,
            restSeconds: item.restSeconds,
            sortOrder: index,
          })),
        },
      },
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
          include: { exercise: true },
        },
      },
    });
  }

  async listWorkoutPlans(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.trainingWorkoutPlan.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          items: {
            orderBy: { sortOrder: 'asc' },
            include: { exercise: true },
          },
        },
      }),
      this.prisma.trainingWorkoutPlan.count({ where: { userId } }),
    ]);

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async logWorkoutSession(userId: string, dto: CreateWorkoutSessionDto) {
    const exerciseIds = dto.exercises.map((item) => item.exerciseId);
    const exercises = await this.prisma.trainingExercise.findMany({
      where: { id: { in: exerciseIds }, userId },
    });

    if (exercises.length !== exerciseIds.length) {
      throw new BadRequestException('errors.invalid_exercise_reference');
    }

    if (dto.planId) {
      const plan = await this.prisma.trainingWorkoutPlan.findFirst({
        where: { id: dto.planId, userId },
      });
      if (!plan) {
        throw new BadRequestException('errors.invalid_plan_reference');
      }
    }

    const completedAt = new Date(dto.completedAt);
    const todayUtc = new Date().toISOString().slice(0, 10);
    const completedDate = completedAt.toISOString().slice(0, 10);
    if (completedDate !== todayUtc) {
      throw new BadRequestException('errors.session_completed_not_today');
    }

    const session = await this.prisma.trainingWorkoutSession.create({
      data: {
        userId,
        planId: dto.planId,
        completedAt,
        exercises: {
          create: dto.exercises.map((item) => ({
            exerciseId: item.exerciseId,
            sets: item.sets as object,
          })),
        },
      },
      include: {
        exercises: {
          include: { exercise: true },
        },
      },
    });

    const date = completedAt.toISOString().slice(0, 10);
    const payload: TrainingSessionCompletedEvent = { userId, date };
    await this.eventEmitter.emitAsync(TRAINING_SESSION_COMPLETED, payload);

    return session;
  }

  async listWorkoutSessions(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.trainingWorkoutSession.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
        skip,
        take: limit,
        include: {
          exercises: {
            include: { exercise: true },
          },
        },
      }),
      this.prisma.trainingWorkoutSession.count({ where: { userId } }),
    ]);

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getLastSessionDate(userId: string): Promise<string | null> {
    const session = await this.prisma.trainingWorkoutSession.findFirst({
      where: { userId },
      orderBy: { completedAt: 'desc' },
    });
    return session ? session.completedAt.toISOString().slice(0, 10) : null;
  }

  async createTemplate(professionalUserId: string, dto: CreateWorkoutTemplateDto) {
    return this.prisma.trainingWorkoutTemplate.create({
      data: {
        professionalUserId,
        name: dto.name.trim(),
        items: dto.items,
      },
    });
  }

  async listTemplates(professionalUserId: string) {
    const templates = await this.prisma.trainingWorkoutTemplate.findMany({
      where: {
        professionalUserId,
        archivedAt: null,
      },
      orderBy: { updatedAt: 'desc' },
    });
    return { templates };
  }

  async updateTemplate(
    professionalUserId: string,
    templateId: string,
    dto: UpdateWorkoutTemplateDto,
  ) {
    const existing = await this.getOwnedTemplate(professionalUserId, templateId);
    return this.prisma.trainingWorkoutTemplate.update({
      where: { id: existing.id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.items !== undefined ? { items: dto.items } : {}),
      },
    });
  }

  async archiveTemplate(professionalUserId: string, templateId: string) {
    const existing = await this.getOwnedTemplate(professionalUserId, templateId);
    return this.prisma.trainingWorkoutTemplate.update({
      where: { id: existing.id },
      data: { archivedAt: new Date() },
    });
  }

  async prescribeWorkoutPlan(
    professionalUserId: string,
    dto: PrescribeWorkoutPlanDto,
  ) {
    await this.coachingService.assertLinked(
      professionalUserId,
      dto.studentUserId,
    );

    let name = dto.name?.trim();
    let items: TemplateExerciseItemDto[] | undefined = dto.items;

    if (dto.templateId) {
      const template = await this.getOwnedTemplate(
        professionalUserId,
        dto.templateId,
      );
      if (template.archivedAt) {
        throw new BadRequestException('errors.template_archived');
      }
      name = name || template.name;
      items = (template.items as TemplateExerciseItemDto[]) ?? undefined;
    }

    if (!name || !items?.length) {
      throw new BadRequestException('errors.prescribe_incomplete');
    }

    const resolvedItems = items;
    const resolvedName = name;

    return this.prisma.$transaction(async (tx) => {
      const createdItems = [];
      for (const [index, item] of resolvedItems.entries()) {
        const exercise = await tx.trainingExercise.create({
          data: {
            userId: dto.studentUserId,
            name: item.name,
            muscleGroup: item.muscleGroup,
            equipment: item.equipment,
          },
        });
        createdItems.push({
          exerciseId: exercise.id,
          sets: item.sets,
          reps: item.reps,
          restSeconds: item.restSeconds,
          sortOrder: index,
        });
      }

      return tx.trainingWorkoutPlan.create({
        data: {
          userId: dto.studentUserId,
          name: resolvedName,
          prescribedByUserId: professionalUserId,
          items: { create: createdItems },
        },
        include: {
          items: {
            orderBy: { sortOrder: 'asc' },
            include: { exercise: true },
          },
        },
      });
    });
  }

  private async getOwnedTemplate(
    professionalUserId: string,
    templateId: string,
  ) {
    const template = await this.prisma.trainingWorkoutTemplate.findFirst({
      where: { id: templateId, professionalUserId },
    });
    if (!template) {
      throw new NotFoundException('errors.template_not_found');
    }
    return template;
  }
}
