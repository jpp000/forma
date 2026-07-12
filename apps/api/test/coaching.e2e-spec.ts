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

describe('Coaching (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let mockEmail: MockEmailProvider;

  const proEmail = 'coach-pro@example.com';
  const studentEmail = 'coach-student@example.com';

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
    await prisma.coachingLinkRequest.deleteMany();
    await prisma.coachingLink.deleteMany();
    await prisma.coachingInvite.deleteMany();
    await prisma.coachingProfessionalProfile.deleteMany();
    await prisma.nutritionPlan.deleteMany();
    await prisma.studentProfile.deleteMany();
    await prisma.identitySession.deleteMany();
    await prisma.identityOtpToken.deleteMany();
    await prisma.identityUser.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  async function auth(email: string): Promise<string> {
    await request(app.getHttpServer())
      .post('/api/identity/otp/request')
      .send({ email });
    const code = mockEmail.getLastCode(email);
    const verify = await request(app.getHttpServer())
      .post('/api/identity/otp/verify')
      .send({ email, code });
    return verify.body.accessToken as string;
  }

  async function createStudent(email: string): Promise<string> {
    const token = await auth(email);
    await request(app.getHttpServer())
      .post('/api/student/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        age: 25,
        sex: 'female',
        heightCm: 165,
        activityLevel: 'moderate',
      });
    return token;
  }

  async function activateProfessional(userId: string) {
    await request(app.getHttpServer())
      .post('/api/billing/webhook')
      .set('stripe-signature', 'mock-signature')
      .send({
        type: 'checkout.session.completed',
        data: { userId, planSlug: 'professional' },
      });
  }

  it('creates professional profile and assigns trainer role', async () => {
    const token = await auth(proEmail);
    const user = await prisma.identityUser.findFirstOrThrow({
      where: { email: proEmail },
    });
    await activateProfessional(user.id);

    const response = await request(app.getHttpServer())
      .post('/api/coaching/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'trainer', credentials: 'CREF 12345' });

    expect(response.status).toBe(201);
    expect(response.body.type).toBe('trainer');

    const me = await request(app.getHttpServer())
      .get('/api/identity/me')
      .set('Authorization', `Bearer ${token}`);

    expect(me.body.roles).toContain('trainer');
  });

  it('invite → accept creates coaching link', async () => {
    const proToken = await auth(proEmail);
    const proUser = await prisma.identityUser.findFirstOrThrow({
      where: { email: proEmail },
    });
    await activateProfessional(proUser.id);
    await request(app.getHttpServer())
      .post('/api/coaching/profile')
      .set('Authorization', `Bearer ${proToken}`)
      .send({ type: 'nutritionist', credentials: 'CRN 999' });

    const invite = await request(app.getHttpServer())
      .post('/api/coaching/invites')
      .set('Authorization', `Bearer ${proToken}`)
      .send({ studentEmail });

    const studentToken = await createStudent(studentEmail);

    const accept = await request(app.getHttpServer())
      .post(`/api/coaching/invites/${invite.body.token}/accept`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(accept.status).toBe(201);
  });

  it('returns 410 for expired invite token', async () => {
    const proToken = await auth(proEmail);
    const proUser = await prisma.identityUser.findFirstOrThrow({
      where: { email: proEmail },
    });
    await activateProfessional(proUser.id);
    await request(app.getHttpServer())
      .post('/api/coaching/profile')
      .set('Authorization', `Bearer ${proToken}`)
      .send({ type: 'trainer', credentials: 'CREF 1' });

    const invite = await prisma.coachingInvite.create({
      data: {
        professionalUserId: (
          await prisma.identityUser.findFirstOrThrow({
            where: { email: proEmail },
          })
        ).id,
        studentEmail,
        token: 'expired-token',
        expiresAt: new Date(Date.now() - 1000),
      },
    });

    const studentToken = await createStudent(studentEmail);
    const response = await request(app.getHttpServer())
      .post(`/api/coaching/invites/${invite.token}/accept`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(response.status).toBe(410);
  });

  it('unlinked professional cannot prescribe nutrition plan', async () => {
    const proToken = await auth(proEmail);
    const proUser = await prisma.identityUser.findFirstOrThrow({
      where: { email: proEmail },
    });
    await activateProfessional(proUser.id);
    await request(app.getHttpServer())
      .post('/api/coaching/profile')
      .set('Authorization', `Bearer ${proToken}`)
      .send({ type: 'nutritionist', credentials: 'CRN 1' });

    const studentToken = await createStudent(studentEmail);
    const me = await request(app.getHttpServer())
      .get('/api/identity/me')
      .set('Authorization', `Bearer ${studentToken}`);

    const response = await request(app.getHttpServer())
      .post('/api/nutrition/plans')
      .set('Authorization', `Bearer ${proToken}`)
      .send({
        studentUserId: me.body.id,
        dailyCalories: 2000,
        dailyProtein: 150,
        dailyCarbs: 200,
        dailyFat: 65,
      });

    expect(response.status).toBe(403);
  });

  it('GET /api/coaching/dashboard returns linked students summary', async () => {
    const proToken = await auth(proEmail);
    const proUser = await prisma.identityUser.findFirstOrThrow({
      where: { email: proEmail },
    });
    await activateProfessional(proUser.id);
    await request(app.getHttpServer())
      .post('/api/coaching/profile')
      .set('Authorization', `Bearer ${proToken}`)
      .send({ type: 'trainer', credentials: 'CREF 99' });

    const invite = await request(app.getHttpServer())
      .post('/api/coaching/invites')
      .set('Authorization', `Bearer ${proToken}`)
      .send({ studentEmail });

    const studentToken = await createStudent(studentEmail);
    await request(app.getHttpServer())
      .post(`/api/coaching/invites/${invite.body.token}/accept`)
      .set('Authorization', `Bearer ${studentToken}`);

    const dashboard = await request(app.getHttpServer())
      .get('/api/coaching/dashboard')
      .set('Authorization', `Bearer ${proToken}`);

    expect(dashboard.status).toBe(200);
    expect(dashboard.body.students).toHaveLength(1);
    expect(dashboard.body.students[0].email).toBe(studentEmail);
  });

  it('PATCH /api/coaching/profile updates publish fields', async () => {
    const token = await auth(proEmail);
    const user = await prisma.identityUser.findFirstOrThrow({
      where: { email: proEmail },
    });
    await activateProfessional(user.id);
    await request(app.getHttpServer())
      .post('/api/coaching/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'trainer', credentials: 'CREF 12345' });

    const incomplete = await request(app.getHttpServer())
      .patch('/api/coaching/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ isPublished: true });

    expect(incomplete.status).toBe(400);

    const published = await request(app.getHttpServer())
      .patch('/api/coaching/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        displayName: 'Coach Ana',
        bio: 'Strength coach',
        slug: 'coach-ana',
        isPublished: true,
      });

    expect(published.status).toBe(200);
    expect(published.body).toMatchObject({
      displayName: 'Coach Ana',
      slug: 'coach-ana',
      isPublished: true,
      bio: 'Strength coach',
    });
  });

  it('PATCH /api/coaching/profile rejects duplicate slug', async () => {
    const tokenA = await auth(proEmail);
    const userA = await prisma.identityUser.findFirstOrThrow({
      where: { email: proEmail },
    });
    await activateProfessional(userA.id);
    await request(app.getHttpServer())
      .post('/api/coaching/profile')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ type: 'trainer', credentials: 'CREF A' });
    await request(app.getHttpServer())
      .patch('/api/coaching/profile')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        displayName: 'A',
        slug: 'taken-slug',
        isPublished: true,
      });

    const otherEmail = 'coach-pro-b@example.com';
    const tokenB = await auth(otherEmail);
    const userB = await prisma.identityUser.findFirstOrThrow({
      where: { email: otherEmail },
    });
    await activateProfessional(userB.id);
    await request(app.getHttpServer())
      .post('/api/coaching/profile')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ type: 'trainer', credentials: 'CREF B' });

    const clash = await request(app.getHttpServer())
      .patch('/api/coaching/profile')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        displayName: 'B',
        slug: 'taken-slug',
        isPublished: true,
      });

    expect(clash.status).toBe(409);
  });

  it('public professionals list and get expose safe fields only', async () => {
    const token = await auth(proEmail);
    const user = await prisma.identityUser.findFirstOrThrow({
      where: { email: proEmail },
    });
    await activateProfessional(user.id);
    const created = await request(app.getHttpServer())
      .post('/api/coaching/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'trainer', credentials: 'CREF 12345' });
    expect(created.status).toBe(201);
    const profileId = created.body.id as string;

    const unpublished = await request(app.getHttpServer()).get(
      `/api/coaching/professionals/${profileId}`,
    );
    expect(unpublished.status).toBe(404);

    await request(app.getHttpServer())
      .patch('/api/coaching/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        displayName: 'Coach Ana',
        bio: 'Strength coach',
        slug: 'coach-ana',
        isPublished: true,
      });

    const list = await request(app.getHttpServer()).get(
      '/api/coaching/professionals',
    );
    expect(list.status).toBe(200);
    expect(list.body.professionals).toHaveLength(1);
    expect(list.body.professionals[0]).toMatchObject({
      displayName: 'Coach Ana',
      slug: 'coach-ana',
      type: 'trainer',
      credentials: 'CREF 12345',
      bio: 'Strength coach',
    });
    expect(list.body.professionals[0].email).toBeUndefined();

    const bySlug = await request(app.getHttpServer()).get(
      '/api/coaching/professionals/coach-ana',
    );
    expect(bySlug.status).toBe(200);
    expect(bySlug.body.slug).toBe('coach-ana');
    expect(bySlug.body.email).toBeUndefined();

    const byId = await request(app.getHttpServer()).get(
      `/api/coaching/professionals/${profileId}`,
    );
    expect(byId.status).toBe(200);
    expect(byId.body.id).toBe(profileId);

    const search = await request(app.getHttpServer()).get(
      '/api/coaching/professionals?q=Ana',
    );
    expect(search.status).toBe(200);
    expect(search.body.professionals).toHaveLength(1);
  });

  it('link request → accept creates coaching link', async () => {
    const proToken = await auth(proEmail);
    const proUser = await prisma.identityUser.findFirstOrThrow({
      where: { email: proEmail },
    });
    await activateProfessional(proUser.id);
    await request(app.getHttpServer())
      .post('/api/coaching/profile')
      .set('Authorization', `Bearer ${proToken}`)
      .send({ type: 'trainer', credentials: 'CREF 12345' });
    await request(app.getHttpServer())
      .patch('/api/coaching/profile')
      .set('Authorization', `Bearer ${proToken}`)
      .send({
        displayName: 'Coach Ana',
        slug: 'coach-ana',
        isPublished: true,
      });

    const studentToken = await createStudent(studentEmail);
    const create = await request(app.getHttpServer())
      .post('/api/coaching/requests')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ professionalUserId: proUser.id });
    expect(create.status).toBe(201);
    expect(create.body.status).toBe('pending');

    const again = await request(app.getHttpServer())
      .post('/api/coaching/requests')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ professionalUserId: proUser.id });
    expect(again.status).toBe(201);
    expect(again.body.id).toBe(create.body.id);

    const list = await request(app.getHttpServer())
      .get('/api/coaching/requests')
      .set('Authorization', `Bearer ${proToken}`);
    expect(list.status).toBe(200);
    expect(list.body.requests).toHaveLength(1);
    expect(list.body.requests[0].studentEmail).toBe(studentEmail);

    const forbidden = await request(app.getHttpServer())
      .get('/api/coaching/requests')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(forbidden.status).toBe(403);

    const accept = await request(app.getHttpServer())
      .post(`/api/coaching/requests/${create.body.id}/accept`)
      .set('Authorization', `Bearer ${proToken}`);
    expect(accept.status).toBe(201);
    expect(accept.body.status).toBe('accepted');

    const link = await prisma.coachingLink.findUnique({
      where: {
        professionalUserId_studentUserId: {
          professionalUserId: proUser.id,
          studentUserId: (
            await prisma.identityUser.findFirstOrThrow({
              where: { email: studentEmail },
            })
          ).id,
        },
      },
    });
    expect(link).not.toBeNull();

    const empty = await request(app.getHttpServer())
      .get('/api/coaching/requests')
      .set('Authorization', `Bearer ${proToken}`);
    expect(empty.body.requests).toHaveLength(0);
  });

  it('link request decline closes without link', async () => {
    const proToken = await auth(proEmail);
    const proUser = await prisma.identityUser.findFirstOrThrow({
      where: { email: proEmail },
    });
    await activateProfessional(proUser.id);
    await request(app.getHttpServer())
      .post('/api/coaching/profile')
      .set('Authorization', `Bearer ${proToken}`)
      .send({ type: 'nutritionist', credentials: 'CRN 1' });
    await request(app.getHttpServer())
      .patch('/api/coaching/profile')
      .set('Authorization', `Bearer ${proToken}`)
      .send({
        displayName: 'Nutri Bea',
        slug: 'nutri-bea',
        isPublished: true,
      });

    const studentToken = await createStudent(studentEmail);
    const create = await request(app.getHttpServer())
      .post('/api/coaching/requests')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ professionalUserId: proUser.id });

    const decline = await request(app.getHttpServer())
      .post(`/api/coaching/requests/${create.body.id}/decline`)
      .set('Authorization', `Bearer ${proToken}`);
    expect(decline.status).toBe(201);
    expect(decline.body.status).toBe('declined');

    const student = await prisma.identityUser.findFirstOrThrow({
      where: { email: studentEmail },
    });
    const link = await prisma.coachingLink.findUnique({
      where: {
        professionalUserId_studentUserId: {
          professionalUserId: proUser.id,
          studentUserId: student.id,
        },
      },
    });
    expect(link).toBeNull();
  });
});
