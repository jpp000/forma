import { Module } from '@nestjs/common';
import { RolesGuard } from '../../common/roles.guard';
import { IdentityModule } from '../identity/identity.module';
import { TrainingController } from './training.controller';
import { TrainingService } from './training.service';

@Module({
  imports: [IdentityModule],
  controllers: [TrainingController],
  providers: [TrainingService, RolesGuard],
  exports: [TrainingService],
})
export class TrainingModule {}
