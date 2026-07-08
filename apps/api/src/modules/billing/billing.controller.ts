import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import { EntitlementGuard } from '../../common/entitlement.guard';
import { RequiresEntitlement } from '../../common/requires-entitlement.decorator';
import { BillingService } from './billing.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('plans')
  @ApiOperation({ summary: 'List billing plans' })
  async listPlans() {
    return this.billingService.listPlans();
  }

  @Post('checkout')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start Stripe checkout' })
  async checkout(
    @CurrentUser() user: { id: string },
    @Body() body: CreateCheckoutDto,
  ) {
    return this.billingService.createCheckout(user.id, body.planSlug);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook handler' })
  async webhook(
    @Req() req: { rawBody?: string },
    @Headers('stripe-signature') signature: string | undefined,
    @Body() body: {
      type: string;
      data: { userId?: string; planSlug?: string; subscriptionId?: string };
    },
  ) {
    const rawBody =
      typeof req.rawBody === 'string' ? req.rawBody : JSON.stringify(body);
    if (!this.billingService.verifyWebhookSignature(rawBody, signature)) {
      throw new BadRequestException('errors.invalid_webhook_signature');
    }

    await this.billingService.handleWebhook(body);
    return { received: true };
  }

  @Get('check/:feature')
  @UseGuards(AuthGuard, EntitlementGuard)
  @RequiresEntitlement('ai_food_recognition')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check AI food entitlement (P2 stub)' })
  async checkEntitlement(@Param('feature') _feature: string) {
    return { allowed: true };
  }
}
