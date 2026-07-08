import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CommonModule } from './common/common.module';
import { I18nModule } from './i18n/i18n.module';
import { HealthModule } from './modules/health/health.module';
import { IdentityModule } from './modules/identity/identity.module';
import { StudentModule } from './modules/student/student.module';
import { TrainingModule } from './modules/training/training.module';
import { NutritionModule } from './modules/nutrition/nutrition.module';
import { ProgressModule } from './modules/progress/progress.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    PrismaModule,
    I18nModule,
    CommonModule,
    HealthModule,
    IdentityModule,
    StudentModule,
    TrainingModule,
    NutritionModule,
    ProgressModule,
  ],
})
export class AppModule {}
