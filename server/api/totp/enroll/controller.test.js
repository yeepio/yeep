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

describe('api/totp.enroll', () => {
  let ctx;

  beforeAll(async () => {
    await server.setup(config);
    ctx = server.getAppContext();
  });

  afterAll(async () => {
    await server.teardown();
  });

  describe('unauthorized user', () => {
    test('returns error pretending resource does not exist', async () => {
      const res = await request(server)
        .post('/api/invitation.create')
        .send();
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 404,
          message: 'Resource does not exist',
        },
      });
    });
  });

  describe('authorized user', () => {
    let wileUser;
    let wileSession;

    beforeAll(async () => {
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
    });

    test('returns error when `secret` body param is undefined', async () => {
      const res = await request(server)
        .post('/api/totp.enroll')
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
      expect(res.body.error.details[0].path).toEqual(['secret']);
      expect(res.body.error.details[0].type).toBe('any.required');
    });

    test('returns error when `secret` body param is invalid', async () => {
      const res = await request(server)
        .post('/api/totp.enroll')
        .set('Authorization', `Bearer ${wileSession.accessToken}`)
        .send({
          secret: 'invalid',
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
      expect(res.body.error.details[0].path).toEqual(['secret']);
      expect(res.body.error.details[0].type).toBe('string.length');
    });

    test('returns error when `token` body param is undefined', async () => {
      const res = await request(server)
        .post('/api/totp.enroll')
        .set('Authorization', `Bearer ${wileSession.accessToken}`)
        .send({
          secret: 'N34CXTAEDWWIETTGN7P7HGFVM2CPGAG2',
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

    test('returns error when `token` body param is invalid', async () => {
      const res = await request(server)
        .post('/api/totp.enroll')
        .set('Authorization', `Bearer ${wileSession.accessToken}`)
        .send({
          secret: 'N34CXTAEDWWIETTGN7P7HGFVM2CPGAG2',
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
});
