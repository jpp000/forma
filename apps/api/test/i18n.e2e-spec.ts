import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { configureApp } from '../src/app.configure';
import { AppModule } from '../src/app.module';

describe('I18n (e2e)', () => {
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

  it('defaults validation errors to pt-BR', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/platform/echo')
      .send({ email: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      expect.arrayContaining(['Informe um e-mail válido']),
    );
  });

  it('returns English validation errors when Accept-Language is en', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/platform/echo')
      .set('Accept-Language', 'en')
      .send({ email: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      expect.arrayContaining(['Must be a valid email address']),
    );
  });

  it('returns localized 401 message for Accept-Language en', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/platform/unauthorized-sample')
      .set('Accept-Language', 'en');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized');
  });

  it('returns localized 401 message in pt-BR by default', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/platform/unauthorized-sample',
    );

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Não autorizado');
  });
});
