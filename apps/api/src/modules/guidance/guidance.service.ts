import { HealthGoal } from '@forma/types';
import { Injectable } from '@nestjs/common';
import type { SupportedLocale } from '../../i18n/i18n.service';
import { I18nService } from '../../i18n/i18n.service';
import { NutritionService } from '../nutrition/nutrition.service';
import { ProgressService } from '../progress/progress.service';
import { StudentService } from '../student/student.service';
import { TrainingService } from '../training/training.service';

export interface GuidanceSuggestion {
  type: string;
  message: string;
  priority: number;
}

@Injectable()
export class GuidanceService {
  constructor(
    private readonly studentService: StudentService,
    private readonly trainingService: TrainingService,
    private readonly nutritionService: NutritionService,
    private readonly progressService: ProgressService,
    private readonly i18n: I18nService,
  ) {}

  async getDailySuggestions(
    userId: string,
    lang: SupportedLocale,
  ): Promise<GuidanceSuggestion[]> {
    const goal = await this.studentService.getHealthGoal(userId);
    const today = new Date().toISOString().slice(0, 10);
    const lastWorkout = await this.trainingService.getLastSessionDate(userId);
    const lastMeal = await this.nutritionService.getLastMealDate(userId);
    const daily = await this.nutritionService.getDailySummary(userId, today);
    const weightTrend = await this.progressService.getWeightTrend(userId);

    const suggestions: GuidanceSuggestion[] = [];

    if (!lastWorkout || daysSince(lastWorkout) >= 2) {
      suggestions.push({
        type: 'training',
        message: this.i18n.t('guidance.training_needed', lang),
        priority: 1,
      });
    }

    if (!lastMeal || lastMeal !== today) {
      suggestions.push({
        type: 'nutrition',
        message: this.i18n.t('guidance.meal_log_needed', lang),
        priority: 2,
      });
    }

    if (daily.target && daily.consumed.calories > daily.target.calories) {
      suggestions.push({
        type: 'nutrition',
        message: this.i18n.t('guidance.calorie_over_target', lang),
        priority: 1,
      });
    }

    if (
      daily.target &&
      daily.consumed.protein < daily.target.protein * 0.7
    ) {
      suggestions.push({
        type: 'nutrition',
        message: this.i18n.t('guidance.protein_gap', lang),
        priority: 2,
      });
    }

    switch (goal.goalType) {
      case HealthGoal.LoseWeight:
        if (weightTrend === 'up') {
          suggestions.push({
            type: 'progress',
            message: this.i18n.t('guidance.weight_trend_up', lang),
            priority: 1,
          });
        }
        break;
      case HealthGoal.GainMuscle:
        if (
          daily.target &&
          daily.consumed.protein < daily.target.protein
        ) {
          suggestions.push({
            type: 'nutrition',
            message: this.i18n.t('guidance.protein_for_muscle', lang),
            priority: 1,
          });
        }
        break;
      case HealthGoal.ImproveHealth:
        suggestions.push({
          type: 'general',
          message: this.i18n.t('guidance.stay_active', lang),
          priority: 3,
        });
        break;
      default:
        break;
    }

    return suggestions.sort((a, b) => a.priority - b.priority);
  }
}

function daysSince(date: string): number {
  const then = new Date(`${date}T00:00:00.000Z`).getTime();
  const now = new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`).getTime();
  return Math.floor((now - then) / (24 * 60 * 60 * 1000));
}
