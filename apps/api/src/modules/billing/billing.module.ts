import { Module } from '@nestjs/common';
import { EntitlementGuard } from '../../common/entitlement.guard';
import { IdentityModule } from '../identity/identity.module';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';

@Module({
  imports: [IdentityModule],
  controllers: [BillingController],
  providers: [BillingService, EntitlementGuard],
  exports: [BillingService],
})
export class BillingModule {}
