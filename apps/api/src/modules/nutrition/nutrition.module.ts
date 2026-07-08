import { forwardRef, Module } from '@nestjs/common';
import { RolesGuard } from '../../common/roles.guard';
import { BillingModule } from '../billing/billing.module';
import { CoachingModule } from '../coaching/coaching.module';
import { IdentityModule } from '../identity/identity.module';
import { NutritionController } from './nutrition.controller';
import { NutritionService } from './nutrition.service';

@Module({
  imports: [IdentityModule, BillingModule, forwardRef(() => CoachingModule)],
  controllers: [NutritionController],
  providers: [NutritionService, RolesGuard],
  exports: [NutritionService],
})
export class NutritionModule {}
