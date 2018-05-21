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

  test('throws 400 "Bad Request" when `slug` contains invalid characters', async () => {
    const res = await request(server)
      .post('/api/v1/org.delete')
      .send({
        slug: '@cme',
      });
    expect(res.status).toBe(400);
    expect(res.body.details[0].path).toEqual(['slug']);
    expect(res.body.details[0].type).toBe('string.regex.name');
  });

  test('throws 400 "Bad Request" when `slug` contains more than 30 characters', async () => {
    const res = await request(server)
      .post('/api/v1/org.delete')
      .send({
        slug: '0123456789012345678901234567890',
      });
    expect(res.status).toBe(400);
    expect(res.body.details[0].path).toEqual(['slug']);
    expect(res.body.details[0].type).toBe('string.max');
  });

  test('throws 400 "Bad Request" when `slug` contains less than 2 characters', async () => {
    const res = await request(server)
      .post('/api/v1/org.delete')
      .send({
        slug: 'a',
      });
    expect(res.status).toBe(400);
    expect(res.body.details[0].path).toEqual(['slug']);
    expect(res.body.details[0].type).toBe('string.min');
  });

  test('throws 400 "Bad Request" when `slug` is unspecified', async () => {
    const res = await request(server)
      .post('/api/v1/org.delete')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.details[0].path).toEqual(['slug']);
    expect(res.body.details[0].type).toBe('any.required');
  });

  test('throws 400 "Bad Request" when payload contains unknown properties', async () => {
    const res = await request(server)
      .post('/api/v1/org.delete')
      .send({
        slug: 'acme',
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
        slug: 'acme',
      });
    expect(res.status).toBe(204);
  });
});
