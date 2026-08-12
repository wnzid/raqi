import { Test } from '@nestjs/testing';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { HealthModule } from '../src/health/health.module';

describe('GET /api/health', () => {
  it('returns the health contract', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [HealthModule] }).compile();
    const app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    await request(app.getHttpServer()).get('/api/health').expect(200).expect(({ body }) => {
      expect(body.status).toBe('ok'); expect(body.service).toBe('api');
    });
    await app.close();
  });
});
