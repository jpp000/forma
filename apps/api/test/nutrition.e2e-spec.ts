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
});
