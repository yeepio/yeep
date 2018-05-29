/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';

describe('api/v1/org.create', () => {
  beforeAll(async () => {
    await server.setup();
  });

  afterAll(async () => {
    await server.teardown();
  });

  test('throws 400 "Bad Request" when `slug` contains invalid characters', async () => {
    const res = await request(server)
      .post('/api/v1/org.create')
      .send({
        name: 'ACME Inc.',
        slug: '@cme',
      });

    expect(res.status).toBe(400);
    expect(res.body.details[0].path).toEqual(['slug']);
    expect(res.body.details[0].type).toBe('string.regex.name');
  });

  test('throws 400 "Bad Request" when `slug` contains more than 30 characters', async () => {
    const res = await request(server)
      .post('/api/v1/org.create')
      .send({
        name: 'ACME Inc.',
        slug: '0123456789012345678901234567890',
      });

    expect(res.status).toBe(400);
    expect(res.body.details[0].path).toEqual(['slug']);
    expect(res.body.details[0].type).toBe('string.max');
  });

  test('throws 400 "Bad Request" when `slug` contains less than 2 characters', async () => {
    const res = await request(server)
      .post('/api/v1/org.create')
      .send({
        name: 'ACME Inc.',
        slug: 'a',
      });

    expect(res.status).toBe(400);
    expect(res.body.details[0].path).toEqual(['slug']);
    expect(res.body.details[0].type).toBe('string.min');
  });

  test('throws 400 "Bad Request" when `name` is unspecified', async () => {
    const res = await request(server)
      .post('/api/v1/org.create')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.details[0].path).toEqual(['name']);
    expect(res.body.details[0].type).toBe('any.required');
  });

  test('throws 400 "Bad Request" when `slug` is unspecified', async () => {
    const res = await request(server)
      .post('/api/v1/org.create')
      .send({ name: 'ACME Inc.' });

    expect(res.status).toBe(400);
    expect(res.body.details[0].path).toEqual(['slug']);
    expect(res.body.details[0].type).toBe('any.required');
  });

  test('throws 400 "Bad Request" when payload contains unknown properties', async () => {
    const res = await request(server)
      .post('/api/v1/org.create')
      .send({
        name: 'ACME Inc.',
        slug: 'acme',
        foo: 'bar',
      });

    expect(res.status).toBe(400);
    expect(res.body.details[0].path).toEqual(['foo']);
    expect(res.body.details[0].type).toBe('object.allowUnknown');
  });

  test('creates new org and returns 201 "Created"', async () => {
    let res = await request(server)
      .post('/api/v1/org.create')
      .send({
        name: 'ACME Inc.',
        slug: 'acme',
      });

    expect(res.status).toBe(201);
    expect(res.type).toMatch(/json/);
    expect(res.body).toMatchObject({
      org: expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        slug: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    });

    res = await request(server)
      .post('/api/v1/org.delete')
      .send({
        slug: 'acme',
      });
    expect(res.status).toBe(204);
  });

  test('throws 409 "Conflict" on duplicate org slug', async () => {
    let res = await request(server)
      .post('/api/v1/org.create')
      .send({
        name: 'ACME Inc.',
        slug: 'acme',
      });
    expect(res.status).toBe(201);

    res = await request(server)
      .post('/api/v1/org.create')
      .send({
        name: 'ACME S.A.',
        slug: 'acme',
      });
    expect(res.status).toBe(409);

    res = await request(server)
      .post('/api/v1/org.delete')
      .send({
        slug: 'acme',
      });
    expect(res.status).toBe(204);
  });
});
