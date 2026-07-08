import { HealthGoal } from '@forma/types';
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

describe('Guidance (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let mockEmail: MockEmailProvider;

  const testEmail = 'guidance-user@example.com';

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
    await prisma.studentHealthGoal.deleteMany();
    await prisma.studentProfile.deleteMany();
    await prisma.identitySession.deleteMany();
    await prisma.identityOtpToken.deleteMany();
    await prisma.identityOAuthAccount.deleteMany();
    await prisma.identityUser.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  async function authenticate(): Promise<string> {
    await request(app.getHttpServer())
      .post('/api/identity/otp/request')
      .send({ email: testEmail });
    const code = mockEmail.getLastCode(testEmail);
    const verify = await request(app.getHttpServer())
      .post('/api/identity/otp/verify')
      .send({ email: testEmail, code });
    return verify.body.accessToken as string;
  }

  it('GET /api/guidance/daily returns localized suggestions for student with goal', async () => {
    const token = await authenticate();

    await request(app.getHttpServer())
      .post('/api/student/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        age: 30,
        sex: 'male',
        heightCm: 175,
        activityLevel: 'moderate',
      });

    await request(app.getHttpServer())
      .put('/api/student/goal')
      .set('Authorization', `Bearer ${token}`)
      .send({ goalType: HealthGoal.LoseWeight, targetCalories: 2000 });

    const response = await request(app.getHttpServer())
      .get('/api/guidance/daily')
      .set('Authorization', `Bearer ${token}`)
      .set('Accept-Language', 'en');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toMatchObject({
      type: expect.any(String),
      message: expect.any(String),
      priority: expect.any(Number),
    });
    expect(
      response.body.some((s: { message: string }) =>
        s.message.includes('trained'),
      ),
    ).toBe(true);
  });

  it('GET /api/guidance/daily returns 403 without student profile', async () => {
    const token = await authenticate();

    const response = await request(app.getHttpServer())
      .get('/api/guidance/daily')
      .set('Authorization', `Bearer ${token}`)
      .set('Accept-Language', 'en');

    expect(response.status).toBe(403);
  });
});
