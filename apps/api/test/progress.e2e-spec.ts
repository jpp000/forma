import { MealType } from '@forma/types';
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
    await prisma.progressTrainingRestDay.deleteMany();
    await prisma.progressWeightEntry.deleteMany();
    await prisma.progressStreak.deleteMany();
    await prisma.trainingWorkoutSessionExercise.deleteMany();
    await prisma.trainingWorkoutSession.deleteMany();
    await prisma.trainingWorkoutPlanItem.deleteMany();
    await prisma.trainingWorkoutPlan.deleteMany();
    await prisma.trainingExercise.deleteMany();
    await prisma.nutritionMealItem.deleteMany();
    await prisma.nutritionMealLog.deleteMany();
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

  async function createExercise(token: string) {
    const response = await request(app.getHttpServer())
      .post('/api/training/exercises')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Squat',
        muscleGroup: 'legs',
        equipment: 'barbell',
      });
    return response.body.id as string;
  }

  function logSession(token: string, exerciseId: string, date: string) {
    return request(app.getHttpServer())
      .post('/api/training/sessions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        completedAt: `${date}T10:00:00.000Z`,
        exercises: [
          {
            exerciseId,
            sets: [{ reps: 5, weightKg: 100 }],
          },
        ],
      });
  }

  function markRestDay(token: string, date: string) {
    return request(app.getHttpServer())
      .post('/api/progress/training-rest-days')
      .set('Authorization', `Bearer ${token}`)
      .send({ date });
  }

  async function getTrainingStreak(token: string) {
    const user = await prisma.identityUser.findFirstOrThrow({
      where: { email: testEmail },
    });
    return prisma.progressStreak.findUnique({
      where: {
        userId_streakType: { userId: user.id, streakType: 'training' },
      },
    });
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

  it('uses grace gap once per week then continues training streak', async () => {
    const token = await createStudent();
    const exerciseId = await createExercise(token);

    await logSession(token, exerciseId, '2026-07-05');
    await logSession(token, exerciseId, '2026-07-06');
    await logSession(token, exerciseId, '2026-07-08');

    const streak = await getTrainingStreak(token);

    expect(streak?.currentStreak).toBe(3);
    expect(streak?.longestStreak).toBe(3);
    expect(streak?.graceGapsUsed).toBe(1);
  });

  it('resets training streak after two unexplained gap days in same week', async () => {
    const token = await createStudent();
    const exerciseId = await createExercise(token);

    await logSession(token, exerciseId, '2026-07-06');
    await logSession(token, exerciseId, '2026-07-09');

    const streak = await getTrainingStreak(token);

    expect(streak?.currentStreak).toBe(1);
    expect(streak?.longestStreak).toBe(1);
  });

  it('continues streak when rest day covers gap between workouts', async () => {
    const token = await createStudent();
    const exerciseId = await createExercise(token);

    await logSession(token, exerciseId, '2026-07-06');
    await markRestDay(token, '2026-07-07');
    await logSession(token, exerciseId, '2026-07-08');

    const streak = await getTrainingStreak(token);

    expect(streak?.currentStreak).toBe(3);
    expect(streak?.longestStreak).toBe(3);
  });

  it('combines rest day and grace gap in same week', async () => {
    const token = await createStudent();
    const exerciseId = await createExercise(token);

    await logSession(token, exerciseId, '2026-07-06');
    await markRestDay(token, '2026-07-07');
    await logSession(token, exerciseId, '2026-07-09');

    const streak = await getTrainingStreak(token);

    expect(streak?.currentStreak).toBe(3);
    expect(streak?.graceGapsUsed).toBe(1);
  });

  it('starts training streak at 1 for rest-only day', async () => {
    const token = await createStudent();

    const response = await markRestDay(token, '2026-07-07');
    expect(response.status).toBe(201);

    const streak = await getTrainingStreak(token);

    expect(streak?.currentStreak).toBe(1);
    expect(streak?.longestStreak).toBe(1);
  });

  it('POST /api/progress/training-rest-days upserts idempotently', async () => {
    const token = await createStudent();

    const first = await markRestDay(token, '2026-07-07');
    const second = await markRestDay(token, '2026-07-07');

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(first.body.id).toBe(second.body.id);

    const count = await prisma.progressTrainingRestDay.count({
      where: { userId: first.body.userId },
    });
    expect(count).toBe(1);
  });

  it('GET /api/progress/training-rest-days returns rest days in range', async () => {
    const token = await createStudent();

    await markRestDay(token, '2026-07-05');
    await markRestDay(token, '2026-07-07');

    const response = await request(app.getHttpServer())
      .get('/api/progress/training-rest-days?from=2026-07-01&to=2026-07-06')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].restDate).toBe('2026-07-05');
    expect(response.body[0].source).toBe('explicit');
  });

  it('increments training streak on session and resets after skipped day', async () => {
    const token = await createStudent();
    const exerciseId = await createExercise(token);

    await logSession(token, exerciseId, '2026-07-05');
    await logSession(token, exerciseId, '2026-07-06');
    await logSession(token, exerciseId, '2026-07-08');
    await logSession(token, exerciseId, '2026-07-10');

    const streak = await getTrainingStreak(token);

    expect(streak?.currentStreak).toBe(1);
    expect(streak?.longestStreak).toBe(3);
  });

  it('GET /api/progress/streaks returns current and longest streaks', async () => {
    const token = await createStudent();

    await request(app.getHttpServer())
      .post('/api/nutrition/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        mealType: MealType.Breakfast,
        date: '2026-07-07',
        items: [{ name: 'Oats', calories: 250, protein: 8, carbs: 45, fat: 5 }],
      });

    const response = await request(app.getHttpServer())
      .get('/api/progress/streaks')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.nutrition.current).toBe(1);
    expect(response.body.nutrition.longest).toBe(1);
    expect(response.body.training).toEqual({ current: 0, longest: 0 });
  });

  it('increments nutrition streak when logging meals', async () => {
    const token = await createStudent();

    await request(app.getHttpServer())
      .post('/api/nutrition/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        mealType: MealType.Breakfast,
        date: '2026-07-07',
        items: [
          { name: 'Eggs', calories: 200, protein: 14, carbs: 2, fat: 14 },
        ],
      });

    await request(app.getHttpServer())
      .post('/api/nutrition/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        mealType: MealType.Lunch,
        date: '2026-07-08',
        items: [
          { name: 'Salad', calories: 300, protein: 10, carbs: 20, fat: 15 },
        ],
      });

    const streak = await prisma.progressStreak.findUnique({
      where: {
        userId_streakType: {
          userId: (
            await prisma.identityUser.findFirstOrThrow({
              where: { email: testEmail },
            })
          ).id,
          streakType: 'nutrition',
        },
      },
    });

    expect(streak?.currentStreak).toBe(2);
    expect(streak?.longestStreak).toBe(2);
  });
});
