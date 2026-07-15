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
    await prisma.trainingWorkoutSessionExercise.deleteMany();
    await prisma.trainingWorkoutSession.deleteMany();
    await prisma.trainingWorkoutPlanItem.deleteMany();
    await prisma.trainingWorkoutPlan.deleteMany();
    await prisma.trainingPeriodizationAssignment.deleteMany();
    await prisma.trainingPeriodizationBlock.deleteMany();
    await prisma.trainingPeriodization.deleteMany();
    await prisma.trainingWorkoutTemplate.deleteMany();
    await prisma.trainingExercise.deleteMany();
    await prisma.billingSubscription.deleteMany();
    await prisma.coachingLink.deleteMany();
    await prisma.coachingInvite.deleteMany();
    await prisma.coachingLinkRequest.deleteMany();
    await prisma.coachingProfessionalProfile.deleteMany();
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

  it('POST /api/training/plans creates plan with valid exercise references', async () => {
    const token = await createStudent(testEmail);

    const exerciseResponse = await request(app.getHttpServer())
      .post('/api/training/exercises')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Bench Press',
        muscleGroup: 'chest',
        equipment: 'barbell',
      });

    const response = await request(app.getHttpServer())
      .post('/api/training/plans')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Push Day',
        items: [
          {
            exerciseId: exerciseResponse.body.id,
            sets: 4,
            reps: 8,
            restSeconds: 90,
          },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Push Day');
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0]).toMatchObject({
      sets: 4,
      reps: 8,
      restSeconds: 90,
    });
  });

  it('GET /api/training/plans lists user workout plans', async () => {
    const token = await createStudent(testEmail);

    const exerciseResponse = await request(app.getHttpServer())
      .post('/api/training/exercises')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Deadlift',
        muscleGroup: 'back',
        equipment: 'barbell',
      });

    await request(app.getHttpServer())
      .post('/api/training/plans')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Pull Day',
        items: [
          {
            exerciseId: exerciseResponse.body.id,
            sets: 3,
            reps: 5,
            restSeconds: 120,
          },
        ],
      });

    const response = await request(app.getHttpServer())
      .get('/api/training/plans')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].name).toBe('Pull Day');
  });

  it('POST /api/training/sessions logs session and GET returns history ordered by date desc', async () => {
    const token = await createStudent(testEmail);
    const today = new Date().toISOString().slice(0, 10);

    const exerciseResponse = await request(app.getHttpServer())
      .post('/api/training/exercises')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Overhead Press',
        muscleGroup: 'shoulders',
        equipment: 'barbell',
      });

    const olderSession = await request(app.getHttpServer())
      .post('/api/training/sessions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        completedAt: `${today}T08:00:00.000Z`,
        exercises: [
          {
            exerciseId: exerciseResponse.body.id,
            sets: [{ reps: 8, weightKg: 40 }],
          },
        ],
      });

    const newerSession = await request(app.getHttpServer())
      .post('/api/training/sessions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        completedAt: `${today}T14:00:00.000Z`,
        exercises: [
          {
            exerciseId: exerciseResponse.body.id,
            sets: [
              { reps: 10, weightKg: 42.5 },
              { reps: 8, weightKg: 45 },
            ],
          },
        ],
      });

    expect(olderSession.status).toBe(201);
    expect(newerSession.status).toBe(201);
    expect(newerSession.body.exercises[0].sets).toEqual([
      { reps: 10, weightKg: 42.5 },
      { reps: 8, weightKg: 45 },
    ]);

    const history = await request(app.getHttpServer())
      .get('/api/training/sessions')
      .set('Authorization', `Bearer ${token}`);

    expect(history.status).toBe(200);
    expect(history.body.items).toHaveLength(2);
    expect(history.body.items[0].id).toBe(newerSession.body.id);
    expect(history.body.items[1].id).toBe(olderSession.body.id);
  });

  it('POST /api/training/sessions rejects completedAt before today UTC', async () => {
    const token = await createStudent(testEmail);
    const yesterday = new Date(Date.now() - 86_400_000)
      .toISOString()
      .slice(0, 10);

    const exerciseResponse = await request(app.getHttpServer())
      .post('/api/training/exercises')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Lat Pulldown',
        muscleGroup: 'back',
        equipment: 'cable',
      });

    const response = await request(app.getHttpServer())
      .post('/api/training/sessions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        completedAt: `${yesterday}T10:00:00.000Z`,
        exercises: [
          {
            exerciseId: exerciseResponse.body.id,
            sets: [{ reps: 10, weightKg: 50 }],
          },
        ],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Só é possível registrar treinos do dia atual',
    );
  });

  const pushItems = [
    {
      name: 'Bench Press',
      muscleGroup: 'chest',
      equipment: 'barbell',
      sets: 3,
      reps: 8,
      restSeconds: 90,
    },
  ];

  async function activateTrainer(email: string): Promise<{
    token: string;
    userId: string;
  }> {
    const token = await authenticate(email);
    const user = await prisma.identityUser.findFirstOrThrow({
      where: { email },
    });
    await request(app.getHttpServer())
      .post('/api/billing/webhook')
      .set('stripe-signature', 'mock-signature')
      .send({
        type: 'checkout.session.completed',
        data: { userId: user.id, planSlug: 'professional' },
      });
    await request(app.getHttpServer())
      .post('/api/coaching/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'trainer', credentials: 'CREF 1' });
    return { token, userId: user.id };
  }

  it('trainer CRUD templates; nutritionist forbidden', async () => {
    const trainerEmail = `trainer-tpl-${Date.now()}@example.com`;
    const { token } = await activateTrainer(trainerEmail);

    const created = await request(app.getHttpServer())
      .post('/api/training/templates')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Push A', items: pushItems });
    expect(created.status).toBe(201);
    expect(created.body.name).toBe('Push A');

    const listed = await request(app.getHttpServer())
      .get('/api/training/templates')
      .set('Authorization', `Bearer ${token}`);
    expect(listed.status).toBe(200);
    expect(listed.body.templates).toHaveLength(1);

    const updated = await request(app.getHttpServer())
      .patch(`/api/training/templates/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Push A v2' });
    expect(updated.status).toBe(200);
    expect(updated.body.name).toBe('Push A v2');

    const archived = await request(app.getHttpServer())
      .post(`/api/training/templates/${created.body.id}/archive`)
      .set('Authorization', `Bearer ${token}`);
    expect(archived.status).toBe(201);

    const afterArchive = await request(app.getHttpServer())
      .get('/api/training/templates')
      .set('Authorization', `Bearer ${token}`);
    expect(afterArchive.body.templates).toHaveLength(0);

    const nutriEmail = `nutri-tpl-${Date.now()}@example.com`;
    const nutriToken = await authenticate(nutriEmail);
    const nutriUser = await prisma.identityUser.findFirstOrThrow({
      where: { email: nutriEmail },
    });
    await request(app.getHttpServer())
      .post('/api/billing/webhook')
      .set('stripe-signature', 'mock-signature')
      .send({
        type: 'checkout.session.completed',
        data: { userId: nutriUser.id, planSlug: 'professional' },
      });
    await request(app.getHttpServer())
      .post('/api/coaching/profile')
      .set('Authorization', `Bearer ${nutriToken}`)
      .send({ type: 'nutritionist', credentials: 'CRN 1' });

    const forbidden = await request(app.getHttpServer())
      .post('/api/training/templates')
      .set('Authorization', `Bearer ${nutriToken}`)
      .send({ name: 'No', items: pushItems });
    expect(forbidden.status).toBe(403);
  });

  it('prescribe from template to linked student; unlinked 403', async () => {
    const trainerEmail = `trainer-pres-${Date.now()}@example.com`;
    const studentEmail = `student-pres-${Date.now()}@example.com`;
    const { token: proToken } = await activateTrainer(trainerEmail);
    const studentToken = await createStudent(studentEmail);
    const student = await prisma.identityUser.findFirstOrThrow({
      where: { email: studentEmail },
    });

    const template = await request(app.getHttpServer())
      .post('/api/training/templates')
      .set('Authorization', `Bearer ${proToken}`)
      .send({ name: 'Full Body', items: pushItems });

    const unlinked = await request(app.getHttpServer())
      .post('/api/training/plans/prescribe')
      .set('Authorization', `Bearer ${proToken}`)
      .send({
        studentUserId: student.id,
        templateId: template.body.id,
      });
    expect(unlinked.status).toBe(403);

    const invite = await request(app.getHttpServer())
      .post('/api/coaching/invites')
      .set('Authorization', `Bearer ${proToken}`)
      .send({ studentEmail });
    await request(app.getHttpServer())
      .post(`/api/coaching/invites/${invite.body.token}/accept`)
      .set('Authorization', `Bearer ${studentToken}`);

    const prescribed = await request(app.getHttpServer())
      .post('/api/training/plans/prescribe')
      .set('Authorization', `Bearer ${proToken}`)
      .send({
        studentUserId: student.id,
        templateId: template.body.id,
      });
    expect(prescribed.status).toBe(201);
    expect(prescribed.body.prescribedByUserId).toBeTruthy();
    expect(prescribed.body.userId).toBe(student.id);
    expect(prescribed.body.items[0].exercise.name).toBe('Bench Press');

    const plans = await request(app.getHttpServer())
      .get('/api/training/plans')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(plans.status).toBe(200);
    expect(
      plans.body.items.some((p: { id: string }) => p.id === prescribed.body.id),
    ).toBe(true);
  });

  it('periodization assign and advance for linked student', async () => {
    const trainerEmail = `trainer-per-${Date.now()}@example.com`;
    const studentEmail = `student-per-${Date.now()}@example.com`;
    const { token: proToken } = await activateTrainer(trainerEmail);
    const studentToken = await createStudent(studentEmail);
    const student = await prisma.identityUser.findFirstOrThrow({
      where: { email: studentEmail },
    });

    const t1 = await request(app.getHttpServer())
      .post('/api/training/templates')
      .set('Authorization', `Bearer ${proToken}`)
      .send({ name: 'Block 1', items: pushItems });
    const t2 = await request(app.getHttpServer())
      .post('/api/training/templates')
      .set('Authorization', `Bearer ${proToken}`)
      .send({
        name: 'Block 2',
        items: [
          {
            name: 'Squat',
            muscleGroup: 'legs',
            equipment: 'barbell',
            sets: 4,
            reps: 5,
            restSeconds: 120,
          },
        ],
      });

    const periodization = await request(app.getHttpServer())
      .post('/api/training/periodizations')
      .set('Authorization', `Bearer ${proToken}`)
      .send({
        name: '8-week',
        blocks: [
          { templateId: t1.body.id, durationDays: 7 },
          { templateId: t2.body.id, durationDays: 7 },
        ],
      });
    expect(periodization.status).toBe(201);
    expect(periodization.body.blocks).toHaveLength(2);

    const unlinked = await request(app.getHttpServer())
      .post(`/api/training/periodizations/${periodization.body.id}/assign`)
      .set('Authorization', `Bearer ${proToken}`)
      .send({ studentUserId: student.id });
    expect(unlinked.status).toBe(403);

    const invite = await request(app.getHttpServer())
      .post('/api/coaching/invites')
      .set('Authorization', `Bearer ${proToken}`)
      .send({ studentEmail });
    await request(app.getHttpServer())
      .post(`/api/coaching/invites/${invite.body.token}/accept`)
      .set('Authorization', `Bearer ${studentToken}`);

    const assigned = await request(app.getHttpServer())
      .post(`/api/training/periodizations/${periodization.body.id}/assign`)
      .set('Authorization', `Bearer ${proToken}`)
      .send({ studentUserId: student.id });
    expect(assigned.status).toBe(201);
    expect(assigned.body.activePosition).toBe(0);
    expect(assigned.body.plan.name).toBe('Block 1');

    const advanced = await request(app.getHttpServer())
      .post(
        `/api/training/periodization-assignments/${assigned.body.assignment.id}/advance`,
      )
      .set('Authorization', `Bearer ${proToken}`);
    expect(advanced.status).toBe(201);
    expect(advanced.body.activePosition).toBe(1);
    expect(advanced.body.plan.name).toBe('Block 2');

    const plans = await request(app.getHttpServer())
      .get('/api/training/plans')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(plans.body.items.length).toBeGreaterThanOrEqual(2);
  });
});
