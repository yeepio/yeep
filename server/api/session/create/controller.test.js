/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import config from '../../../../yeep.config';
import createUser from '../../user/create/service';
import deleteUser from '../../user/delete/service';

describe('api/v1/session.create', () => {
  let ctx;
  let user;

  beforeAll(async () => {
    await server.setup(config);
    ctx = server.getAppContext();

    user = await createUser(ctx.db, {
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
    await deleteUser(ctx.db, user);
    await server.teardown();
  });

  test('returns error when username is invalid', async () => {
    const res = await request(server)
      .post('/api/v1/session.create')
      .send({
        userKey: 'a',
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

  test('returns error when email does not exist', async () => {
    const res = await request(server)
      .post('/api/v1/session.create')
      .send({
        userKey: 'unknown@email.com',
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

  test('returns error when username does not exist', async () => {
    const res = await request(server)
      .post('/api/v1/session.create')
      .send({
        userKey: 'notuser',
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
        userKey: 'wile',
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

  test('creates new session with username + password', async () => {
    const res = await request(server)
      .post('/api/v1/session.create')
      .send({
        userKey: 'Wile', // this will be automaticaly lower-cased
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

  test('creates new session with email address + password', async () => {
    const res = await request(server)
      .post('/api/v1/session.create')
      .send({
        userKey: 'coyote@acme.com',
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
