/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';

describe('api/v1/org.delete', () => {
  beforeAll(async () => {
    await server.setup();
  });
  afterAll(async () => {
    await server.teardown();
  });

  test('throws 400 "Bad Request" when `id` contains invalid characters', async () => {
    const res = await request(server)
      .post('/api/v1/org.delete')
      .send({
        id: '507f1f77bcf86cd79943901@',
      });
    expect(res.status).toBe(400);
    expect(res.body.details[0].path).toEqual(['id']);
    expect(res.body.details[0].type).toBe('string.hex');
  });

  test('throws 400 "Bad Request" when `id` contains more than 24 characters', async () => {
    const res = await request(server)
      .post('/api/v1/org.delete')
      .send({
        id: '507f1f77bcf86cd7994390112',
      });
    expect(res.status).toBe(400);
    expect(res.body.details[0].path).toEqual(['id']);
    expect(res.body.details[0].type).toBe('string.length');
  });

  test('throws 400 "Bad Request" when `id` contains less than 24 characters', async () => {
    const res = await request(server)
      .post('/api/v1/org.delete')
      .send({
        id: '507f1f77bcf86cd79943901',
      });
    expect(res.status).toBe(400);
    expect(res.body.details[0].path).toEqual(['id']);
    expect(res.body.details[0].type).toBe('string.length');
  });

  test('throws 400 "Bad Request" when `id` is unspecified', async () => {
    const res = await request(server)
      .post('/api/v1/org.delete')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.details[0].path).toEqual(['id']);
    expect(res.body.details[0].type).toBe('any.required');
  });

  test('throws 400 "Bad Request" when payload contains unknown properties', async () => {
    const res = await request(server)
      .post('/api/v1/org.delete')
      .send({
        id: '507f1f77bcf86cd799439011',
        foo: 'bar',
      });
    expect(res.status).toBe(400);
    expect(res.body.details[0].path).toEqual(['foo']);
    expect(res.body.details[0].type).toBe('object.allowUnknown');
  });

  test('deletes org and returns 204 "No Content"', async () => {
    let res = await request(server)
      .post('/api/v1/org.create')
      .send({
        name: 'ACME Inc.',
        slug: 'acme',
      });
    expect(res.status).toBe(201);

    res = await request(server)
      .post('/api/v1/org.delete')
      .send({
        id: res.body.org.id,
      });
    expect(res.status).toBe(204);
  });
});
