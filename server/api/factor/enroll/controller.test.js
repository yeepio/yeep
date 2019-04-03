/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import config from '../../../../yeep.config';
import createUser from '../../user/create/service';
// import createOrg from '../../org/create/service';
import deleteUser from '../../user/delete/service';
// import deleteOrg from '../../org/delete/service';
import createSession from '../../session/create/service';
import destroySession from '../../session/destroy/service';

describe('api/factor.enroll', () => {
  let ctx;
  let wileUser;
  let wileSession;

  beforeAll(async () => {
    await server.setup(config);
    ctx = server.getAppContext();

    wileUser = await createUser(ctx, {
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

    wileSession = await createSession(ctx, {
      username: 'wile',
      password: 'catch-the-b1rd$',
    });
  });

  afterAll(async () => {
    await destroySession(ctx, wileSession);
    await deleteUser(ctx, wileUser);
    await server.teardown();
  });

  test('returns error when `type` body param is undefined', async () => {
    const res = await request(server)
      .post('/api/factor.enroll')
      .set('Authorization', `Bearer ${wileSession.accessToken}`)
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
    expect(res.body.error.details[0].path).toEqual(['type']);
    expect(res.body.error.details[0].type).toBe('any.required');
  });

  test('returns error when `type` body param is unknown', async () => {
    const res = await request(server)
      .post('/api/factor.enroll')
      .set('Authorization', `Bearer ${wileSession.accessToken}`)
      .send({
        type: 'unknown',
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
    expect(res.body.error.details[0].path).toEqual(['type']);
    expect(res.body.error.details[0].type).toBe('any.allowOnly');
  });

  test('returns error when `key` body param is undefined', async () => {
    const res = await request(server)
      .post('/api/factor.enroll')
      .set('Authorization', `Bearer ${wileSession.accessToken}`)
      .send({
        type: 'SOTP',
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
    expect(res.body.error.details[0].path).toEqual(['key']);
    expect(res.body.error.details[0].type).toBe('any.required');
  });

  test('returns error when `key` body param is invalid', async () => {
    const res = await request(server)
      .post('/api/factor.enroll')
      .set('Authorization', `Bearer ${wileSession.accessToken}`)
      .send({
        type: 'SOTP',
        key: 'invalid',
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
    expect(res.body.error.details[0].path).toEqual(['key']);
    expect(res.body.error.details[0].type).toBe('string.length');
  });

  test('returns error when `key` body param is undefined', async () => {
    const res = await request(server)
      .post('/api/factor.enroll')
      .set('Authorization', `Bearer ${wileSession.accessToken}`)
      .send({
        type: 'SOTP',
        key: 'N34CXTAEDWWIETTGN7P7HGFVM2CPGAG2',
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
    expect(res.body.error.details[0].path).toEqual(['token']);
    expect(res.body.error.details[0].type).toBe('any.required');
  });

  test('returns error when `key` body param is invalid', async () => {
    const res = await request(server)
      .post('/api/factor.enroll')
      .set('Authorization', `Bearer ${wileSession.accessToken}`)
      .send({
        type: 'SOTP',
        key: 'N34CXTAEDWWIETTGN7P7HGFVM2CPGAG2',
        token: '1234567', // i.e. more chars than expected
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
    expect(res.body.error.details[0].path).toEqual(['token']);
    expect(res.body.error.details[0].type).toBe('string.length');
  });
});
