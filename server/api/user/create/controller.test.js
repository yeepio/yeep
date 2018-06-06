/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';

describe('api/v1/user.create', () => {
  beforeAll(async () => {
    await server.setup();
  });

  afterAll(async () => {
    await server.teardown();
  });

  test('returns error when `emails` contains duplicate addresses', async () => {
    const res = await request(server)
      .post('/api/v1/user.create')
      .send({
        username: 'wile',
        password: 'catch-the-b1rd$',
        fullName: 'Wile E. Coyote',
        emails: [
          {
            address: 'coyote@acme.com',
            isVerified: false,
            isPrimary: false,
          },
          {
            address: 'coyote@acme.com',
            isVerified: false,
            isPrimary: false,
          },
        ],
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
    expect(res.body.error.details[0].path).toEqual(['emails', 1]);
    expect(res.body.error.details[0].type).toBe('array.unique');
  });

  test('returns error when primary email is not specified', async () => {
    const res = await request(server)
      .post('/api/v1/user.create')
      .send({
        username: 'wile',
        password: 'catch-the-b1rd$',
        fullName: 'Wile E. Coyote',
        emails: [
          {
            address: 'coyote@acme.com',
            isVerified: false,
            isPrimary: false,
          },
          {
            address: 'wile@acme.com',
            isVerified: false,
            isPrimary: false,
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10004,
        message: 'You must specify at least 1 primary email',
      },
    });
  });

  test('throws error when multiple primary emails are specified', async () => {
    const res = await request(server)
      .post('/api/v1/user.create')
      .send({
        username: 'wile',
        password: 'catch-the-b1rd$',
        fullName: 'Wile E. Coyote',
        emails: [
          {
            address: 'coyote@acme.com',
            isVerified: false,
            isPrimary: true,
          },
          {
            address: 'wile@acme.com',
            isVerified: false,
            isPrimary: true,
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10004,
        message: expect.any(String),
      },
    });
  });

  test('creates new user and returns expected response', async () => {
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
    expect(res.body).toEqual({
      ok: true,
      user: expect.objectContaining({
        id: expect.any(String),
        username: 'wile',
        fullName: 'Wile E. Coyote',
        picture: null,
        emails: [
          {
            address: 'coyote@acme.com',
            isVerified: true,
            isPrimary: true,
          },
        ],
        orgs: [],
        roles: [],
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    });

    res = await request(server)
      .post('/api/v1/user.delete')
      .send({
        id: res.body.user.id,
      });
    expect(res.status).toBe(204);
  });

  test('returns error on duplicate username', async () => {
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

    const { id } = res.body.user;

    res = await request(server)
      .post('/api/v1/user.create')
      .send({
        username: 'wile',
        password: 'play-wolf',
        fullName: 'Road Runner',
        emails: [
          {
            address: 'beep-beep@acme.com',
            isVerified: true,
            isPrimary: true,
          },
        ],
      });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10006,
        message: expect.any(String),
      },
    });

    res = await request(server)
      .post('/api/v1/user.delete')
      .send({ id });
    expect(res.status).toBe(204);
  });

  test('returns error on duplicate email address', async () => {
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
          {
            address: 'carnivorous@acme.com',
            isVerified: false,
            isPrimary: false,
          },
        ],
      });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
    });

    const { id } = res.body.user;

    res = await request(server)
      .post('/api/v1/user.create')
      .send({
        username: 'roadrunner',
        password: 'play-wolf',
        fullName: 'Road Runner',
        emails: [
          {
            address: 'Carnivorous@acme.com',
            isVerified: true,
            isPrimary: true,
          },
        ],
      });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10005,
        message: expect.any(String),
      },
    });

    res = await request(server)
      .post('/api/v1/user.delete')
      .send({ id });
    expect(res.status).toBe(204);
  });
});
