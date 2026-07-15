import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';
import { CoachingService } from '../coaching/coaching.service';
import type { CreateNutritionPlanDto } from './dto/create-nutrition-plan.dto';
import type { CreateNutritionTemplateDto } from './dto/create-nutrition-template.dto';
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
    @Inject(forwardRef(() => CoachingService))
    private readonly coachingService: CoachingService,
    private readonly billingService: BillingService,
  ) {}

  async logMeal(userId: string, dto: LogMealDto) {
    const logDate = parseLogDate(dto.date);

    const logsToday = await this.prisma.nutritionMealLog.count({
      where: { userId, logDate },
    });
    await this.billingService.assertMealLogLimit(userId, logsToday);

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
    await this.eventEmitter.emitAsync(NUTRITION_MEAL_LOGGED, payload);

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
    await this.coachingService.assertLinked(
      professionalUserId,
      dto.studentUserId,
    );

    let dailyCalories = dto.dailyCalories;
    let dailyProtein = dto.dailyProtein;
    let dailyCarbs = dto.dailyCarbs;
    let dailyFat = dto.dailyFat;

    if (dto.templateId) {
      const template = await this.prisma.nutritionPlanTemplate.findFirst({
        where: {
          id: dto.templateId,
          professionalUserId,
          archivedAt: null,
        },
      });
      if (!template) {
        throw new NotFoundException('errors.template_not_found');
      }
      dailyCalories = template.dailyCalories;
      dailyProtein = template.dailyProtein;
      dailyCarbs = template.dailyCarbs;
      dailyFat = template.dailyFat;
    }

    if (
      dailyCalories === undefined ||
      dailyProtein === undefined ||
      dailyCarbs === undefined ||
      dailyFat === undefined
    ) {
      throw new BadRequestException('errors.prescribe_incomplete');
    }

    return this.prisma.nutritionPlan.create({
      data: {
        studentUserId: dto.studentUserId,
        professionalUserId,
        dailyCalories,
        dailyProtein,
        dailyCarbs,
        dailyFat,
      },
    });
  }

  async createTemplate(
    professionalUserId: string,
    dto: CreateNutritionTemplateDto,
  ) {
    return this.prisma.nutritionPlanTemplate.create({
      data: {
        professionalUserId,
        name: dto.name.trim(),
        dailyCalories: dto.dailyCalories,
        dailyProtein: dto.dailyProtein,
        dailyCarbs: dto.dailyCarbs,
        dailyFat: dto.dailyFat,
        menuJson:
          (dto.menuJson as unknown as Prisma.InputJsonValue | undefined) ??
          undefined,
      },
    });
  }

  async listTemplates(professionalUserId: string) {
    const templates = await this.prisma.nutritionPlanTemplate.findMany({
      where: { professionalUserId, archivedAt: null },
      orderBy: { updatedAt: 'desc' },
    });
    return { templates };
  }

  async archiveTemplate(professionalUserId: string, templateId: string) {
    const existing = await this.prisma.nutritionPlanTemplate.findFirst({
      where: { id: templateId, professionalUserId },
    });
    if (!existing) {
      throw new NotFoundException('errors.template_not_found');
    }
    return this.prisma.nutritionPlanTemplate.update({
      where: { id: existing.id },
      data: { archivedAt: new Date() },
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
