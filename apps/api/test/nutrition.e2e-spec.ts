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

describe('Nutrition (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let mockEmail: MockEmailProvider;

  const studentEmail = 'nutrition-student@example.com';
  const proEmail = 'nutrition-pro@example.com';

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
    await prisma.nutritionMealItem.deleteMany();
    await prisma.nutritionMealLog.deleteMany();
    await prisma.nutritionPlan.deleteMany();
    await prisma.coachingLink.deleteMany();
    await prisma.coachingInvite.deleteMany();
    await prisma.coachingProfessionalProfile.deleteMany();
    await prisma.billingSubscription.deleteMany();
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
        sex: 'female',
        heightCm: 165,
        activityLevel: 'moderate',
      });
    return token;
  }

  it('POST /api/nutrition/meals logs meal with manual macros', async () => {
    const token = await createStudent(studentEmail);

    const response = await request(app.getHttpServer())
      .post('/api/nutrition/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        mealType: MealType.Breakfast,
        date: '2026-07-07',
        items: [
          {
            name: 'Oats',
            calories: 300,
            protein: 10,
            carbs: 50,
            fat: 6,
          },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0]).toMatchObject({
      name: 'Oats',
      calories: 300,
      protein: 10,
      carbs: 50,
      fat: 6,
    });
  });

  it('appends items when logging same meal type on same day', async () => {
    const token = await createStudent(studentEmail);

    await request(app.getHttpServer())
      .post('/api/nutrition/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        mealType: MealType.Lunch,
        date: '2026-07-07',
        items: [
          {
            name: 'Rice',
            calories: 200,
            protein: 4,
            carbs: 45,
            fat: 1,
          },
        ],
      });

    const response = await request(app.getHttpServer())
      .post('/api/nutrition/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        mealType: MealType.Lunch,
        date: '2026-07-07',
        items: [
          {
            name: 'Chicken',
            calories: 250,
            protein: 30,
            carbs: 0,
            fat: 12,
          },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.items).toHaveLength(2);
  });

  it('GET /api/nutrition/daily returns macro totals for date', async () => {
    const token = await createStudent(studentEmail);

    await request(app.getHttpServer())
      .post('/api/nutrition/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        mealType: MealType.Dinner,
        date: '2026-07-07',
        items: [
          {
            name: 'Salmon',
            calories: 400,
            protein: 35,
            carbs: 0,
            fat: 25,
          },
        ],
      });

    const response = await request(app.getHttpServer())
      .get('/api/nutrition/daily?date=2026-07-07')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.consumed).toEqual({
      calories: 400,
      protein: 35,
      carbs: 0,
      fat: 25,
    });
    expect(response.body.target).toBeNull();
  });

  it('GET /api/nutrition/daily returns zeros for empty day', async () => {
    const token = await createStudent(studentEmail);

    const response = await request(app.getHttpServer())
      .get('/api/nutrition/daily?date=2026-07-08')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.consumed).toEqual({
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    });
  });

  it('POST /api/nutrition/plans stores targets and daily summary shows consumed vs target', async () => {
    const studentToken = await createStudent(studentEmail);
    const proToken = await authenticate(proEmail);

    const proUser = await prisma.identityUser.findFirstOrThrow({
      where: { email: proEmail },
    });
    await request(app.getHttpServer())
      .post('/api/billing/webhook')
      .set('stripe-signature', 'mock-signature')
      .send({
        type: 'checkout.session.completed',
        data: { userId: proUser.id, planSlug: 'professional' },
      });

    await request(app.getHttpServer())
      .post('/api/coaching/profile')
      .set('Authorization', `Bearer ${proToken}`)
      .send({ type: 'nutritionist', credentials: 'CRN 123' });

    const invite = await request(app.getHttpServer())
      .post('/api/coaching/invites')
      .set('Authorization', `Bearer ${proToken}`)
      .send({ studentEmail });

    await request(app.getHttpServer())
      .post(`/api/coaching/invites/${invite.body.token}/accept`)
      .set('Authorization', `Bearer ${studentToken}`);

    const meResponse = await request(app.getHttpServer())
      .get('/api/identity/me')
      .set('Authorization', `Bearer ${studentToken}`);

    await request(app.getHttpServer())
      .post('/api/nutrition/plans')
      .set('Authorization', `Bearer ${proToken}`)
      .send({
        studentUserId: meResponse.body.id,
        dailyCalories: 2000,
        dailyProtein: 150,
        dailyCarbs: 200,
        dailyFat: 65,
      });

    await request(app.getHttpServer())
      .post('/api/nutrition/meals')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        mealType: MealType.Snack,
        date: '2026-07-07',
        items: [
          {
            name: 'Protein shake',
            calories: 200,
            protein: 40,
            carbs: 5,
            fat: 2,
          },
        ],
      });

    const summary = await request(app.getHttpServer())
      .get('/api/nutrition/daily?date=2026-07-07')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(summary.status).toBe(200);
    expect(summary.body.consumed.calories).toBe(200);
    expect(summary.body.target).toEqual({
      calories: 2000,
      protein: 150,
      carbs: 200,
      fat: 65,
    });
  });
});
