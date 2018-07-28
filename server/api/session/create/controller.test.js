/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import createUser from '../../user/create/service';
import deleteUser from '../../user/delete/service';

describe('api/v1/session.create', () => {
  let ctx;

  beforeAll(async () => {
    await server.setup();
    ctx = server.getAppContext();

    ctx.user = await createUser(ctx.db, {
      username: 'wile',
      password: 'catch-the-b1rd$',
      fullName: 'Wile E. Coyote',
      picture: 'https://www.acme.com/pictures/coyote.png',
      emails: [
        {
          address: 'coyote@acme.com',
          isVerified: true,
          isPrimary: true,
        },
      ],
    });
  });

  afterAll(async () => {
    await deleteUser(ctx.db, ctx.user);
    await server.teardown();
  });

  test('returns error when username is invalid', async () => {
    const res = await request(server)
      .post('/api/v1/session.create')
      .send({
        username: 'a',
        password: 'password',
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
  });

  test('returns error when user does not exist', async () => {
    const res = await request(server)
      .post('/api/v1/session.create')
      .send({
        username: 'notuser',
        password: 'password',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10001,
        message: expect.any(String),
      },
    });
  });

  test('returns error when password is invalid', async () => {
    const res = await request(server)
      .post('/api/v1/session.create')
      .send({
        username: 'wile',
        password: 'invalid-password',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10002,
        message: expect.any(String),
      },
    });
  });

  test('creates new session', async () => {
    const res = await request(server)
      .post('/api/v1/session.create')
      .send({
        username: 'Wile',
        password: 'catch-the-b1rd$',
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        ok: true,
        token: expect.any(String),
        expiresIn: expect.any(Number),
      })
    );
  });
});
