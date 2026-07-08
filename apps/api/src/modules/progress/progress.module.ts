import { Module } from '@nestjs/common';
import { RolesGuard } from '../../common/roles.guard';
import { IdentityModule } from '../identity/identity.module';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

@Module({
  imports: [IdentityModule],
  controllers: [ProgressController],
  providers: [ProgressService, RolesGuard],
  exports: [ProgressService],
})
export class ProgressModule {}
