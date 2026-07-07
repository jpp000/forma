import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateExerciseDto } from './dto/create-exercise.dto';

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
}
