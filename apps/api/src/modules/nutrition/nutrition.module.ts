import { Module } from '@nestjs/common';
import { RolesGuard } from '../../common/roles.guard';
import { IdentityModule } from '../identity/identity.module';
import { NutritionController } from './nutrition.controller';
import { NutritionService } from './nutrition.service';

@Module({
  imports: [IdentityModule],
  controllers: [NutritionController],
  providers: [NutritionService, RolesGuard],
  exports: [NutritionService],
})
export class NutritionModule {}
