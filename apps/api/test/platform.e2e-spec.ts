import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { configureApp } from '../src/app.configure';
import { AppModule } from '../src/app.module';

describe('Platform foundation (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await configureApp(app);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/docs serves Swagger UI', async () => {
    const response = await request(app.getHttpServer()).get('/api/docs');

    expect(response.status).toBe(200);
    expect(response.text).toContain('swagger');
  });

  it('POST /api/platform/echo returns 400 for invalid body', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/platform/echo')
      .send({ email: 'not-an-email' });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      statusCode: 400,
      error: expect.any(String),
    });
    expect(response.body.message).toEqual(
      expect.arrayContaining([expect.any(String)]),
    );
  });

  it('returns consistent shape for unhandled errors', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/platform/unauthorized-sample',
    );

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      statusCode: 401,
      message: expect.any(String),
      error: expect.any(String),
    });
  });
});
