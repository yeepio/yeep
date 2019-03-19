/* eslint-env jest */
import request from 'supertest';
import SwaggerParser from 'swagger-parser';
import server from '../../../server';

describe('api/v1/openapi', () => {
  test('responds as expected', async () => {
    const res = await request(server).get('/api/v1/openapi');
    expect(res.status).toEqual(200);
    expect(res.type).toMatch(/json/);
    expect(res.body).toMatchObject({
      openapi: '3.0.0',
    });
    expect(SwaggerParser.validate(res.body)).resolves.not.toThrow();
  });
});
