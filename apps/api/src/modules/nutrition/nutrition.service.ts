import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateNutritionPlanDto } from './dto/create-nutrition-plan.dto';
import type { LogMealDto } from './dto/log-meal.dto';
import {
  NUTRITION_MEAL_LOGGED,
  type NutritionMealLoggedEvent,
} from './events/nutrition.events';

function parseLogDate(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function formatLogDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

@Injectable()
export class NutritionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async logMeal(userId: string, dto: LogMealDto) {
    const logDate = parseLogDate(dto.date);

    const mealLog = await this.prisma.nutritionMealLog.upsert({
      where: {
        userId_mealType_logDate: {
          userId,
          mealType: dto.mealType,
          logDate,
        },
      },
      create: {
        userId,
        mealType: dto.mealType,
        logDate,
        items: {
          create: dto.items,
        },
      },
      update: {
        items: {
          create: dto.items,
        },
      },
      include: { items: true },
    });

    const payload: NutritionMealLoggedEvent = {
      userId,
      date: dto.date,
    };
    this.eventEmitter.emit(NUTRITION_MEAL_LOGGED, payload);

    return mealLog;
  }

  async getDailySummary(userId: string, date: string) {
    const logDate = parseLogDate(date);

    const mealLogs = await this.prisma.nutritionMealLog.findMany({
      where: { userId, logDate },
      include: { items: true },
    });

    const consumed = mealLogs.reduce(
      (totals, log) => {
        for (const item of log.items) {
          totals.calories += item.calories;
          totals.protein += item.protein;
          totals.carbs += item.carbs;
          totals.fat += item.fat;
        }
        return totals;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    const plan = await this.prisma.nutritionPlan.findFirst({
      where: { studentUserId: userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      date,
      consumed,
      target: plan
        ? {
            calories: plan.dailyCalories,
            protein: plan.dailyProtein,
            carbs: plan.dailyCarbs,
            fat: plan.dailyFat,
          }
        : null,
    };
  }

  async prescribePlan(professionalUserId: string, dto: CreateNutritionPlanDto) {
    return this.prisma.nutritionPlan.create({
      data: {
        studentUserId: dto.studentUserId,
        professionalUserId,
        dailyCalories: dto.dailyCalories,
        dailyProtein: dto.dailyProtein,
        dailyCarbs: dto.dailyCarbs,
        dailyFat: dto.dailyFat,
      },
    });
  }

  async getLastMealDate(userId: string): Promise<string | null> {
    const last = await this.prisma.nutritionMealLog.findFirst({
      where: { userId },
      orderBy: { logDate: 'desc' },
    });
    return last ? formatLogDate(last.logDate) : null;
  }
}
