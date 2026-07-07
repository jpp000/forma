import { MealType } from '@forma/types';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import type { LogMealDto } from './dto/log-meal.dto';
import {
  NUTRITION_MEAL_LOGGED,
  type NutritionMealLoggedEvent,
} from './events/nutrition.events';

@Injectable()
export class NutritionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private parseDate(date?: string): Date {
    const value = date ?? new Date().toISOString().slice(0, 10);
    return new Date(`${value}T00:00:00.000Z`);
  }

  async logMeal(userId: string, dto: LogMealDto) {
    const logDate = this.parseDate(dto.date);

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
          create: dto.items.map((item) => ({
            name: item.name,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
          })),
        },
      },
      update: {
        items: {
          create: dto.items.map((item) => ({
            name: item.name,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
          })),
        },
      },
      include: { items: true },
    });

    const date = logDate.toISOString().slice(0, 10);
    const payload: NutritionMealLoggedEvent = { userId, date };
    this.eventEmitter.emit(NUTRITION_MEAL_LOGGED, payload);

    return mealLog;
  }

  async getDailySummary(userId: string, date?: string) {
    const logDate = this.parseDate(date);

    const items = await this.prisma.nutritionMealItem.findMany({
      where: {
        mealLog: {
          userId,
          logDate,
        },
      },
    });

    const consumed = items.reduce(
      (totals, item) => ({
        calories: totals.calories + item.calories,
        protein: totals.protein + item.protein,
        carbs: totals.carbs + item.carbs,
        fat: totals.fat + item.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    const plan = await this.prisma.nutritionPlan.findFirst({
      where: { studentUserId: userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      date: logDate.toISOString().slice(0, 10),
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

  async getLastMealDate(userId: string): Promise<string | null> {
    const last = await this.prisma.nutritionMealLog.findFirst({
      where: { userId },
      orderBy: { logDate: 'desc' },
    });
    return last ? last.logDate.toISOString().slice(0, 10) : null;
  }

  async getDailyTotalsForDate(userId: string, date: string) {
    const summary = await this.getDailySummary(userId, date);
    return summary.consumed;
  }
}
