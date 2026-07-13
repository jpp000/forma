import { forwardRef, Module } from '@nestjs/common';
import { RolesGuard } from '../../common/roles.guard';
import { CoachingModule } from '../coaching/coaching.module';
import { IdentityModule } from '../identity/identity.module';
import { TrainingController } from './training.controller';
import { TrainingService } from './training.service';

@Module({
  imports: [IdentityModule, forwardRef(() => CoachingModule)],
  controllers: [TrainingController],
  providers: [TrainingService, RolesGuard],
  exports: [TrainingService],
})
export class TrainingModule {}
