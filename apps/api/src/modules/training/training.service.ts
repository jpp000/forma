import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateExerciseDto } from './dto/create-exercise.dto';
import type { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';

@Injectable()
export class TrainingService {
  constructor(private readonly prisma: PrismaService) {}

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
}
