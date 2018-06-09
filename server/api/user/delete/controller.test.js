/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';

describe('api/v1/user.delete', () => {
  beforeAll(async () => {
    await server.setup();
  });
  afterAll(async () => {
    await server.teardown();
  });

  test('returns error when `id` contains invalid characters', async () => {
    const res = await request(server)
      .post('/api/v1/user.delete')
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
      .post('/api/v1/user.delete')
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
      .post('/api/v1/user.delete')
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
      .post('/api/v1/user.delete')
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
      .post('/api/v1/user.delete')
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

  test('deletes user and returns expected response', async () => {
    let res = await request(server)
      .post('/api/v1/user.create')
      .send({
        username: 'Wile',
        password: 'catch-the-b1rd$',
        fullName: 'Wile E. Coyote',
        emails: [
          {
            address: 'coyote@acme.com',
            isVerified: true,
            isPrimary: true,
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
    });

    const { id: userId } = res.body.user;

    res = await request(server)
      .post('/api/v1/user.delete')
      .send({ id: userId });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
    });
  });
});
