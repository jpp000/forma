import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { NutritionMealLoggedEvent } from '../nutrition/events/nutrition.events';
import { NUTRITION_MEAL_LOGGED } from '../nutrition/events/nutrition.events';
import type { TrainingSessionCompletedEvent } from '../training/events/training.events';
import { TRAINING_SESSION_COMPLETED } from '../training/events/training.events';
import { ProgressService } from './progress.service';

@Injectable()
export class ProgressListeners {
  constructor(private readonly progressService: ProgressService) {}

  @OnEvent(TRAINING_SESSION_COMPLETED)
  async onTrainingSessionCompleted(
    payload: TrainingSessionCompletedEvent,
  ): Promise<void> {
    await this.progressService.applyTrainingActivity(
      payload.userId,
      payload.date,
    );
  }

  @OnEvent(NUTRITION_MEAL_LOGGED)
  async onNutritionMealLogged(
    payload: NutritionMealLoggedEvent,
  ): Promise<void> {
    await this.progressService.updateStreak(
      payload.userId,
      'nutrition',
      payload.date,
    );
  }
}
