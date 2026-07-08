import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { configureApp } from '../src/app.configure';
import { AppModule } from '../src/app.module';
import { MockEmailProvider } from '../src/modules/identity/email/mock-email.provider';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Billing (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let mockEmail: MockEmailProvider;

  const userEmail = 'billing-user@example.com';

  beforeAll(async () => {
    process.env.EMAIL_PROVIDER = 'mock';
    process.env.JWT_SECRET = 'test-jwt-secret';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await configureApp(app);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    prisma = app.get(PrismaService);
    mockEmail = app.get(MockEmailProvider);
  });

  beforeEach(async () => {
    mockEmail.clear();
    await prisma.billingSubscription.deleteMany();
    await prisma.identitySession.deleteMany();
    await prisma.identityOtpToken.deleteMany();
    await prisma.identityUser.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  async function auth(): Promise<string> {
    await request(app.getHttpServer())
      .post('/api/identity/otp/request')
      .send({ email: userEmail });
    const code = mockEmail.getLastCode(userEmail);
    const verify = await request(app.getHttpServer())
      .post('/api/identity/otp/verify')
      .send({ email: userEmail, code });
    return verify.body.accessToken as string;
  }

  it('GET /api/billing/plans returns seeded tiers', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/billing/plans',
    );

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(3);
    expect(
      response.body.some((p: { slug: string }) => p.slug === 'student_free'),
    ).toBe(true);
    expect(
      response.body.some((p: { slug: string }) => p.slug === 'student_pro'),
    ).toBe(true);
  });

  it('POST /api/billing/checkout returns checkout url (mock)', async () => {
    const token = await auth();

    const response = await request(app.getHttpServer())
      .post('/api/billing/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ planSlug: 'student_pro' });

    expect(response.status).toBe(201);
    expect(response.body.url).toContain('checkout.stripe.com');
  });

  it('webhook activates subscription on checkout.session.completed', async () => {
    await auth();
    const user = await prisma.identityUser.findFirstOrThrow({
      where: { email: userEmail },
    });

    const response = await request(app.getHttpServer())
      .post('/api/billing/webhook')
      .set('stripe-signature', 'mock-signature')
      .send({
        type: 'checkout.session.completed',
        data: { userId: user.id, planSlug: 'student_pro' },
      });

    expect(response.status).toBe(201);
    expect(response.body.received).toBe(true);

    const sub = await prisma.billingSubscription.findUnique({
      where: { userId: user.id },
      include: { plan: true },
    });
    expect(sub?.status).toBe('active');
    expect(sub?.plan.slug).toBe('student_pro');
  });

  it('webhook rejects invalid signature with 400', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/billing/webhook')
      .set('stripe-signature', 'invalid')
      .send({ type: 'checkout.session.completed', data: {} });

    expect(response.status).toBe(400);
  });

  it('free user gets 402 on AI food entitlement check', async () => {
    const token = await auth();

    const response = await request(app.getHttpServer())
      .get('/api/billing/check/ai_food_recognition')
      .set('Authorization', `Bearer ${token}`)
      .set('Accept-Language', 'en');

    expect(response.status).toBe(402);
    expect(response.body.message).toBe(
      'Upgrade required to access this feature',
    );
    expect(response.body.upgradeUrl).toBe('/api/billing/checkout');
  });

  it('pro user passes AI entitlement check', async () => {
    const token = await auth();
    const user = await prisma.identityUser.findFirstOrThrow({
      where: { email: userEmail },
    });

    await request(app.getHttpServer())
      .post('/api/billing/webhook')
      .set('stripe-signature', 'mock-signature')
      .send({
        type: 'checkout.session.completed',
        data: { userId: user.id, planSlug: 'student_pro' },
      });

    const response = await request(app.getHttpServer())
      .get('/api/billing/check/ai_food_recognition')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.allowed).toBe(true);
  });

  it('POST /api/coaching/profile returns 402 without professional subscription', async () => {
    const token = await auth();

    const response = await request(app.getHttpServer())
      .post('/api/coaching/profile')
      .set('Authorization', `Bearer ${token}`)
      .set('Accept-Language', 'en')
      .send({ type: 'trainer', credentials: 'CREF 1' });

    expect(response.status).toBe(402);
  });
});
