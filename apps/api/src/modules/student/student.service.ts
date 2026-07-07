import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HealthGoal, Role } from '@forma/types';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateStudentProfileDto } from './dto/create-student-profile.dto';
import type { SetHealthGoalDto } from './dto/set-health-goal.dto';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async createProfile(userId: string, dto: CreateStudentProfileDto) {
    const existing = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });
    if (existing) {
      return existing;
    }

    return this.prisma.studentProfile.create({
      data: {
        userId,
        age: dto.age,
        sex: dto.sex,
        heightCm: dto.heightCm,
        activityLevel: dto.activityLevel,
      },
    });
  }

  async getProfileByUserId(userId: string) {
    return this.prisma.studentProfile.findUnique({ where: { userId } });
  }

  async requireProfile(userId: string) {
    const profile = await this.getProfileByUserId(userId);
    if (!profile) {
      throw new ForbiddenException('errors.student_profile_required');
    }
    return profile;
  }

  async setHealthGoal(userId: string, dto: SetHealthGoalDto) {
    const profile = await this.requireProfile(userId);

    return this.prisma.studentHealthGoal.upsert({
      where: { studentProfileId: profile.id },
      create: {
        studentProfileId: profile.id,
        goalType: dto.goalType,
        targetWeightKg: dto.targetWeightKg,
        targetCalories: dto.targetCalories,
      },
      update: {
        goalType: dto.goalType,
        targetWeightKg: dto.targetWeightKg,
        targetCalories: dto.targetCalories,
      },
    });
  }

  async getHealthGoal(userId: string) {
    const profile = await this.requireProfile(userId);
    const goal = await this.prisma.studentHealthGoal.findUnique({
      where: { studentProfileId: profile.id },
    });
    if (!goal) {
      throw new NotFoundException('errors.health_goal_not_found');
    }
    return goal;
  }

  async hasRole(userId: string, role: Role): Promise<boolean> {
    if (role !== Role.Student) {
      return false;
    }
    const profile = await this.getProfileByUserId(userId);
    return profile !== null;
  }
}
