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

describe('Student (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let mockEmail: MockEmailProvider;

  const testEmail = 'student-user@example.com';

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
    const verifyResponse = await request(app.getHttpServer())
      .post('/api/identity/otp/verify')
      .send({ email: testEmail, code });

    return verifyResponse.body.accessToken as string;
  }

  it('POST /api/student/profile returns 401 when unauthenticated', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/student/profile')
      .send({
        age: 30,
        sex: 'male',
        heightCm: 175,
        activityLevel: 'moderate',
      });

    expect(response.status).toBe(401);
  });

  it('creates student profile and assigns student role on GET /identity/me', async () => {
    const token = await authenticate();

    const createResponse = await request(app.getHttpServer())
      .post('/api/student/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        age: 30,
        sex: 'male',
        heightCm: 175,
        activityLevel: 'moderate',
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
      age: 30,
      sex: 'male',
      heightCm: 175,
      activityLevel: 'moderate',
    });

    const meResponse = await request(app.getHttpServer())
      .get('/api/identity/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.roles).toContain('student');
  });

  it('PUT /api/student/goal persists goal for student', async () => {
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

    const response = await request(app.getHttpServer())
      .put('/api/student/goal')
      .set('Authorization', `Bearer ${token}`)
      .send({
        goalType: HealthGoal.LoseWeight,
        targetWeightKg: 72,
        targetCalories: 1800,
      });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      goalType: HealthGoal.LoseWeight,
      targetWeightKg: 72,
      targetCalories: 1800,
    });
  });

  it('PUT /api/student/goal returns 403 without student profile', async () => {
    const token = await authenticate();

    const response = await request(app.getHttpServer())
      .put('/api/student/goal')
      .set('Authorization', `Bearer ${token}`)
      .set('Accept-Language', 'en')
      .send({ goalType: HealthGoal.Maintain });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Access denied');
  });
});
