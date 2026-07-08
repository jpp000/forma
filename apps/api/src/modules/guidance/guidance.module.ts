import { Module } from '@nestjs/common';
import { RolesGuard } from '../../common/roles.guard';
import { I18nModule } from '../../i18n/i18n.module';
import { IdentityModule } from '../identity/identity.module';
import { NutritionModule } from '../nutrition/nutrition.module';
import { ProgressModule } from '../progress/progress.module';
import { StudentModule } from '../student/student.module';
import { TrainingModule } from '../training/training.module';
import { GuidanceController } from './guidance.controller';
import { GuidanceService } from './guidance.service';

@Module({
  imports: [
    IdentityModule,
    StudentModule,
    TrainingModule,
    NutritionModule,
    ProgressModule,
    I18nModule,
  ],
  controllers: [GuidanceController],
  providers: [GuidanceService, RolesGuard],
  exports: [GuidanceService],
})
export class GuidanceModule {}
