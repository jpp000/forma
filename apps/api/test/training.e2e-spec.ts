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

describe('Training (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let mockEmail: MockEmailProvider;

  const testEmail = 'training-user@example.com';
  const otherEmail = 'other-training-user@example.com';

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
    await prisma.trainingExercise.deleteMany();
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

  async function authenticate(email: string): Promise<string> {
    await request(app.getHttpServer())
      .post('/api/identity/otp/request')
      .send({ email });

    const code = mockEmail.getLastCode(email);
    const verifyResponse = await request(app.getHttpServer())
      .post('/api/identity/otp/verify')
      .send({ email, code });

    return verifyResponse.body.accessToken as string;
  }

  async function createStudent(email: string): Promise<string> {
    const token = await authenticate(email);
    await request(app.getHttpServer())
      .post('/api/student/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        age: 28,
        sex: 'male',
        heightCm: 180,
        activityLevel: 'moderate',
      });
    return token;
  }

  it('POST /api/training/exercises creates custom exercise for student', async () => {
    const token = await createStudent(testEmail);

    const response = await request(app.getHttpServer())
      .post('/api/training/exercises')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Barbell Squat',
        muscleGroup: 'legs',
        equipment: 'barbell',
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      name: 'Barbell Squat',
      muscleGroup: 'legs',
      equipment: 'barbell',
    });
    expect(response.body.id).toBeDefined();
  });

  it('GET /api/training/exercises returns paginated user exercises', async () => {
    const token = await createStudent(testEmail);
    const otherToken = await createStudent(otherEmail);

    await request(app.getHttpServer())
      .post('/api/training/exercises')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Pull-up',
        muscleGroup: 'back',
        equipment: 'bodyweight',
      });

    await request(app.getHttpServer())
      .post('/api/training/exercises')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({
        name: 'Other Exercise',
        muscleGroup: 'chest',
        equipment: 'dumbbell',
      });

    const response = await request(app.getHttpServer())
      .get('/api/training/exercises?page=1&limit=20')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].name).toBe('Pull-up');
    expect(response.body.page).toBe(1);
    expect(response.body.limit).toBe(20);
    expect(response.body.total).toBe(1);
  });
});
