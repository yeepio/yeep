/* eslint-env jest */
import request from 'supertest';
import SwaggerParser from 'swagger-parser';
import server from '../../../server';

describe('api/docs', () => {
  test('responds as expected', async () => {
    const res = await request(server).get('/api/docs');
    expect(res.status).toEqual(200);
    expect(res.type).toMatch(/json/);
    expect(res.body).toMatchObject({
      openapi: '3.0.0',
    });
    expect(SwaggerParser.validate(res.body)).resolves.not.toThrow();
  });
});
