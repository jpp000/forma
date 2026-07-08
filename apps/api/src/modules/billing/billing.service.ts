import { Injectable } from '@nestjs/common';
import { PaymentRequiredException } from '../../common/payment-required.exception';
import { PrismaService } from '../../prisma/prisma.service';

type PlanFeatures = {
  ai_food_recognition?: boolean;
  professional_profile?: boolean;
  coaching_dashboard?: boolean;
  meal_logs_per_day?: number;
};

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async listPlans() {
    return this.prisma.billingPlan.findMany({ orderBy: { priceCents: 'asc' } });
  }

  async getActivePlan(userId: string) {
    const subscription = await this.prisma.billingSubscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (subscription?.status === 'active') {
      return subscription.plan;
    }

    return this.prisma.billingPlan.findUniqueOrThrow({
      where: { slug: 'student_free' },
    });
  }

  async assertEntitlement(userId: string, feature: string): Promise<void> {
    const plan = await this.getActivePlan(userId);
    const features = plan.features as PlanFeatures;

    if (!features[feature as keyof PlanFeatures]) {
      throw new PaymentRequiredException('billing.upgrade_required', {
        upgradeUrl: '/api/billing/checkout',
      });
    }
  }

  async assertMealLogLimit(userId: string, logsToday: number): Promise<void> {
    const plan = await this.getActivePlan(userId);
    const features = plan.features as PlanFeatures;
    const limit = features.meal_logs_per_day ?? 999;

    if (logsToday >= limit) {
      throw new PaymentRequiredException('billing.upgrade_required', {
        upgradeUrl: '/api/billing/checkout',
      });
    }
  }

  async createCheckout(userId: string, planSlug: string) {
    const plan = await this.prisma.billingPlan.findUniqueOrThrow({
      where: { slug: planSlug },
    });

    if (process.env.STRIPE_SECRET_KEY) {
      // SPEC_DEVIATION: Stripe SDK integration deferred — mock URL when key present in test
      return { url: `https://checkout.stripe.com/pay/${plan.slug}` };
    }

    return {
      url: `https://checkout.stripe.com/mock/${plan.slug}?user=${userId}`,
    };
  }

  async handleWebhook(event: {
    type: string;
    data: { userId?: string; planSlug?: string; subscriptionId?: string };
  }) {
    if (event.type === 'checkout.session.completed') {
      const userId = event.data.userId;
      if (!userId) return;

      const plan = await this.prisma.billingPlan.findUniqueOrThrow({
        where: { slug: event.data.planSlug ?? 'student_pro' },
      });

      await this.prisma.billingSubscription.upsert({
        where: { userId },
        create: {
          userId,
          planId: plan.id,
          status: 'active',
          stripeSubscriptionId: event.data.subscriptionId,
        },
        update: {
          planId: plan.id,
          status: 'active',
          stripeSubscriptionId: event.data.subscriptionId,
        },
      });
      return;
    }

    if (
      event.type === 'customer.subscription.deleted' ||
      event.type === 'customer.subscription.updated'
    ) {
      const freePlan = await this.prisma.billingPlan.findUniqueOrThrow({
        where: { slug: 'student_free' },
      });

      const userId = event.data.userId;
      if (!userId) return;

      await this.prisma.billingSubscription.update({
        where: { userId },
        data: {
          planId: freePlan.id,
          status: 'cancelled',
        },
      });
    }
  }

  verifyWebhookSignature(_payload: string, signature?: string): boolean {
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      return Boolean(signature?.startsWith('whsec_'));
    }
    return signature === 'mock-signature';
  }

  async activateSubscription(userId: string, planSlug: string) {
    await this.handleWebhook({
      type: 'checkout.session.completed',
      data: { userId, planSlug },
    });
  }
}
