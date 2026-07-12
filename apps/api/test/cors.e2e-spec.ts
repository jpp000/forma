import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { configureApp } from '../src/app.configure';
import { AppModule } from '../src/app.module';

async function createConfiguredApp(): Promise<NestFastifyApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  );
  await configureApp(app);
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  return app;
}

describe('CORS_ORIGIN (e2e)', () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousCorsOrigin = process.env.CORS_ORIGIN;

  afterEach(() => {
    process.env.NODE_ENV = previousNodeEnv;
    if (previousCorsOrigin === undefined) {
      delete process.env.CORS_ORIGIN;
    } else {
      process.env.CORS_ORIGIN = previousCorsOrigin;
    }
  });

  it('reflects Allow-Origin in production when CORS_ORIGIN is set', async () => {
    process.env.NODE_ENV = 'production';
    process.env.CORS_ORIGIN = 'http://localhost:5173';

    const app = await createConfiguredApp();
    try {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .set('Origin', 'http://localhost:5173');

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe(
        'http://localhost:5173',
      );
    } finally {
      await app.close();
    }
  });

  it('does not open CORS in production when CORS_ORIGIN is unset', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.CORS_ORIGIN;

    const app = await createConfiguredApp();
    try {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .set('Origin', 'http://localhost:5173');

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    } finally {
      await app.close();
    }
  });
});
