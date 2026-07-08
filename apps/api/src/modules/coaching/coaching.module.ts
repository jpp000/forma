import { Module, forwardRef } from '@nestjs/common';
import { RolesGuard } from '../../common/roles.guard';
import { EntitlementGuard } from '../../common/entitlement.guard';
import { BillingModule } from '../billing/billing.module';
import { IdentityModule } from '../identity/identity.module';
import { NutritionModule } from '../nutrition/nutrition.module';
import { ProgressModule } from '../progress/progress.module';
import { TrainingModule } from '../training/training.module';
import { CoachingController } from './coaching.controller';
import { CoachingService } from './coaching.service';

@Module({
  imports: [
    IdentityModule,
    BillingModule,
    TrainingModule,
    forwardRef(() => NutritionModule),
    ProgressModule,
  ],
  controllers: [CoachingController],
  providers: [CoachingService, RolesGuard, EntitlementGuard],
  exports: [CoachingService],
})
export class CoachingModule {}
