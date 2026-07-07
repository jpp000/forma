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

describe('Identity OTP (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let mockEmail: MockEmailProvider;

  const testEmail = 'otp-user@example.com';

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
    await prisma.identitySession.deleteMany();
    await prisma.identityOtpToken.deleteMany();
    await prisma.identityOAuthAccount.deleteMany();
    await prisma.identityUser.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/identity/otp/request returns 202 for valid email', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/identity/otp/request')
      .send({ email: testEmail });

    expect(response.status).toBe(202);
  });

  it('verify correct OTP returns JWT and creates user', async () => {
    await request(app.getHttpServer())
      .post('/api/identity/otp/request')
      .send({ email: testEmail });

    const code = mockEmail.getLastCode(testEmail);
    expect(code).toMatch(/^\d{6}$/);

    const response = await request(app.getHttpServer())
      .post('/api/identity/otp/verify')
      .send({ email: testEmail, code });

    expect(response.status).toBe(201);
    expect(response.body.accessToken).toEqual(expect.any(String));

    const user = await prisma.identityUser.findUnique({
      where: { email: testEmail },
    });
    expect(user).not.toBeNull();
  });

  it('returns 401 with localized message for wrong OTP', async () => {
    await request(app.getHttpServer())
      .post('/api/identity/otp/request')
      .send({ email: testEmail });

    const response = await request(app.getHttpServer())
      .post('/api/identity/otp/verify')
      .set('Accept-Language', 'en')
      .send({ email: testEmail, code: '000000' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid code');
  });

  it('returns 401 for expired OTP', async () => {
    const { createHash } = await import('node:crypto');
    const code = '654321';
    const codeHash = createHash('sha256').update(code).digest('hex');

    await prisma.identityOtpToken.create({
      data: {
        email: testEmail,
        codeHash,
        expiresAt: new Date(Date.now() - 60_000),
      },
    });

    const response = await request(app.getHttpServer())
      .post('/api/identity/otp/verify')
      .send({ email: testEmail, code });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Código expirado');
  });

  it('returns 429 when OTP is requested more than 3 times in 15 minutes', async () => {
    for (let i = 0; i < 3; i++) {
      const response = await request(app.getHttpServer())
        .post('/api/identity/otp/request')
        .send({ email: testEmail });
      expect(response.status).toBe(202);
    }

    const response = await request(app.getHttpServer())
      .post('/api/identity/otp/request')
      .set('Accept-Language', 'en')
      .send({ email: testEmail });

    expect(response.status).toBe(429);
    expect(response.body.message).toBe(
      'Too many attempts. Try again in a few minutes',
    );
  });

  describe('GET /api/identity/me', () => {
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

    it('rejects missing JWT with 401', async () => {
      const response = await request(app.getHttpServer()).get('/api/identity/me');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Não autorizado');
    });

    it('rejects invalid JWT with 401', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/identity/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    it('returns user id, email, and roles for valid JWT', async () => {
      const token = await authenticate();

      const response = await request(app.getHttpServer())
        .get('/api/identity/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        email: testEmail,
        roles: [],
      });
    });

    it('rejects expired session with 401', async () => {
      const token = await authenticate();
      const user = await prisma.identityUser.findUniqueOrThrow({
        where: { email: testEmail },
      });

      await prisma.identitySession.updateMany({
        where: { userId: user.id },
        data: { expiresAt: new Date(Date.now() - 60_000) },
      });

      const response = await request(app.getHttpServer())
        .get('/api/identity/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
    });
  });
});
