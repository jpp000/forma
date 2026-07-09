import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateExerciseDto } from './dto/create-exercise.dto';
import type { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import type { CreateWorkoutSessionDto } from './dto/create-workout-session.dto';
import {
  TRAINING_SESSION_COMPLETED,
  type TrainingSessionCompletedEvent,
} from './events/training.events';

@Injectable()
export class TrainingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
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
}
