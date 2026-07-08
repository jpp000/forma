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

describe('Progress (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let mockEmail: MockEmailProvider;

  const testEmail = 'progress-user@example.com';

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
    await prisma.progressWeightEntry.deleteMany();
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

  async function createStudent(): Promise<string> {
    await request(app.getHttpServer())
      .post('/api/identity/otp/request')
      .send({ email: testEmail });
    const code = mockEmail.getLastCode(testEmail);
    const verify = await request(app.getHttpServer())
      .post('/api/identity/otp/verify')
      .send({ email: testEmail, code });
    const token = verify.body.accessToken as string;
    await request(app.getHttpServer())
      .post('/api/student/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        age: 30,
        sex: 'male',
        heightCm: 175,
        activityLevel: 'moderate',
      });
    return token;
  }

  it('POST /api/progress/weight logs weight in kg', async () => {
    const token = await createStudent();

    const response = await request(app.getHttpServer())
      .post('/api/progress/weight')
      .set('Authorization', `Bearer ${token}`)
      .send({ weightKg: 75.5, date: '2026-07-07' });

    expect(response.status).toBe(201);
    expect(response.body.weightKg).toBe(75.5);
  });

  it('POST /api/progress/weight upserts duplicate date', async () => {
    const token = await createStudent();

    await request(app.getHttpServer())
      .post('/api/progress/weight')
      .set('Authorization', `Bearer ${token}`)
      .send({ weightKg: 75, date: '2026-07-07' });

    const response = await request(app.getHttpServer())
      .post('/api/progress/weight')
      .set('Authorization', `Bearer ${token}`)
      .send({ weightKg: 74.2, date: '2026-07-07' });

    expect(response.status).toBe(201);
    expect(response.body.weightKg).toBe(74.2);

    const count = await prisma.progressWeightEntry.count({
      where: { userId: response.body.userId },
    });
    expect(count).toBe(1);
  });

  it('GET /api/progress/weight returns history for date range', async () => {
    const token = await createStudent();

    await request(app.getHttpServer())
      .post('/api/progress/weight')
      .set('Authorization', `Bearer ${token}`)
      .send({ weightKg: 76, date: '2026-07-01' });

    await request(app.getHttpServer())
      .post('/api/progress/weight')
      .set('Authorization', `Bearer ${token}`)
      .send({ weightKg: 75, date: '2026-07-07' });

    const response = await request(app.getHttpServer())
      .get('/api/progress/weight?from=2026-07-01&to=2026-07-07')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].weightKg).toBe(76);
    expect(response.body[1].weightKg).toBe(75);
  });
});
