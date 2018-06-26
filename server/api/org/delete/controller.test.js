/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import createOrg from '../create/service';

describe('api/v1/org.delete', () => {
  let ctx;

  beforeAll(async () => {
    await server.setup();
    ctx = server.getAppContext();
  });

  afterAll(async () => {
    await server.teardown();
  });

  test('returns error when `id` contains invalid characters', async () => {
    const res = await request(server)
      .post('/api/v1/org.delete')
      .send({
        id: '507f1f77bcf86cd79943901@',
      });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 400,
        message: 'Invalid request body',
        details: expect.any(Array),
      },
    });
    expect(res.body.error.details[0].path).toEqual(['id']);
    expect(res.body.error.details[0].type).toBe('string.hex');
  });

  test('returns error when `id` contains more than 24 characters', async () => {
    const res = await request(server)
      .post('/api/v1/org.delete')
      .send({
        id: '507f1f77bcf86cd7994390112',
      });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 400,
        message: 'Invalid request body',
        details: expect.any(Array),
      },
    });
    expect(res.body.error.details[0].path).toEqual(['id']);
    expect(res.body.error.details[0].type).toBe('string.length');
  });

  test('returns error when `id` contains less than 24 characters', async () => {
    const res = await request(server)
      .post('/api/v1/org.delete')
      .send({
        id: '507f1f77bcf86cd79943901',
      });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 400,
        message: 'Invalid request body',
        details: expect.any(Array),
      },
    });
    expect(res.body.error.details[0].path).toEqual(['id']);
    expect(res.body.error.details[0].type).toBe('string.length');
  });

  test('returns error when `id` is unspecified', async () => {
    const res = await request(server)
      .post('/api/v1/org.delete')
      .send({});
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 400,
        message: 'Invalid request body',
        details: expect.any(Array),
      },
    });
    expect(res.body.error.details[0].path).toEqual(['id']);
    expect(res.body.error.details[0].type).toBe('any.required');
  });

  test('returns error when payload contains unknown properties', async () => {
    const res = await request(server)
      .post('/api/v1/org.delete')
      .send({
        id: '507f1f77bcf86cd799439011',
        foo: 'bar',
      });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 400,
        message: 'Invalid request body',
        details: expect.any(Array),
      },
    });
    expect(res.body.error.details[0].path).toEqual(['foo']);
    expect(res.body.error.details[0].type).toBe('object.allowUnknown');
  });

  test('deletes org and returns expected response', async () => {
    const org = await createOrg(ctx.db, {
      name: 'ACME Inc.',
      slug: 'acme',
    });

    const res = await request(server)
      .post('/api/v1/org.delete')
      .send({
        id: org.id,
      });
    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        ok: true,
      })
    );
  });
});
