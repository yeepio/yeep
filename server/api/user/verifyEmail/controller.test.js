/* eslint-env jest */
import request from 'supertest';
import isWithinRange from 'date-fns/is_within_range';
import addSeconds from 'date-fns/add_seconds';
import server from '../../../server';
import config from '../../../../yeep.config';
import createUser from '../create/service';
import deleteUser from '../delete/service';
import createSession from '../../session/create/service';
import destroySession from '../../session/destroy/service';
import createPermissionAssignment from '../assignPermission/service';
import deletePermissionAssignment from '../revokePermission/service';

describe('api/user.verifyEmail', () => {
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
        .post('/api/user.verifyEmail')
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
    let wile;
    let wileSession;
    let oswell;
    let unverifiedEmail = {
      address: 'coyote-unverified@acme.com',
      isVerified: false,
      isPrimary: false,
    };
    beforeAll(async () => {
      [wile, oswell] = await Promise.all([
        createUser(ctx, {
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
            {
              ...unverifiedEmail,
            },
          ],
        }),
        createUser(ctx, {
          username: 'oswell',
          password: 'our-business-$s-l1f3-1ts3lf',
          fullName: 'Oswell E. Spencer',
          picture: 'https://www.umbrella.com/pictures/spencer.png',
          emails: [
            {
              address: 'oswellspencer@umbrella.com',
              isVerified: true,
              isPrimary: true,
            },
          ],
        }),
      ]);

      wileSession = await createSession(ctx, {
        username: 'wile',
        password: 'catch-the-b1rd$',
      });
    });

    afterAll(async () => {
      await destroySession(ctx, wileSession);
      await deleteUser(ctx, wile);
      await deleteUser(ctx, oswell);
    });

    test('initiates verify email process and returns expected response', async () => {
      const f = jest.fn();
      ctx.bus.once('email_verification_init', f);

      const startDate = new Date();
      let res = await request(server)
        .post('/api/user.verifyEmail')
        .set('Authorization', `Bearer ${wileSession.accessToken}`)
        .send({
          id: wile.id,
          emailAddress: unverifiedEmail.address,
        });
      const endDate = new Date();

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
      });

      expect(f).toHaveBeenCalledWith({
        user: expect.objectContaining({
          id: expect.any(String),
          fullName: expect.any(String),
          emailAddress: unverifiedEmail.address,
          picture: expect.any(String),
        }),
        token: expect.objectContaining({
          id: expect.any(String),
          secret: expect.any(String),
          type: 'EMAIL_VERIFICATION',
          createdAt: expect.any(Date),
          expiresAt: expect.any(Date),
        }),
      });

      expect(
        isWithinRange(
          f.mock.calls[0][0].token.expiresAt,
          startDate,
          addSeconds(endDate, 4 * 60 * 60)
        )
      ).toEqual(true);
    });

    test('returns error when user does not exist', async () => {
      const res = await request(server)
        .post('/api/user.verifyEmail')
        .set('Authorization', `Bearer ${wileSession.accessToken}`)
        .send({
          id: '507f1f77bcf86cd799439012', // i.e. some random ID
          emailAddress: 'random@email.com',
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

    test('returns error when emailAddress is invalid', async () => {
      const res = await request(server)
        .post('/api/user.verifyEmail')
        .set('Authorization', `Bearer ${wileSession.accessToken}`)
        .send({
          emailAddress: 'randomstring',
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

    test('returns error when emailAddress does not exist', async () => {
      const res = await request(server)
        .post('/api/user.verifyEmail')
        .set('Authorization', `Bearer ${wileSession.accessToken}`)
        .send({
          id: wile.id,
          emailAddress: 'random@email.com',
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10036,
          message: expect.any(String),
        },
      });
    });

    test('returns error when tokenExpiresInSeconds is invalid', async () => {
      const res = await request(server)
        .post('/api/user.verifyEmail')
        .set('Authorization', `Bearer ${wileSession.accessToken}`)
        .send({
          tokenExpiresInSeconds: 'NaN',
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 400,
          message: 'Invalid request body',
        },
      });
    });

    test('returns unauthorized error when trying to update user without permission', async () => {
      const res = await request(server)
        .post('/api/user.verifyEmail')
        .set('Authorization', `Bearer ${wileSession.accessToken}`)
        .send({
          id: oswell.id,
          emailAddress: unverifiedEmail.address,
        });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10012,
          message: expect.any(String),
        },
      });
    });
  });

  describe('superuser', () => {
    let wile;
    let superuser;
    let superuserSession;
    let permissionAssignment;
    let unverifiedEmail = {
      address: 'coyote-unverified@acme.com',
      isVerified: false,
      isPrimary: false,
    };
    beforeAll(async () => {
      [wile, superuser] = await Promise.all([
        createUser(ctx, {
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
            {
              ...unverifiedEmail,
            },
          ],
        }),
        createUser(ctx, {
          username: 'oswell',
          password: 'our-business-$s-l1f3-1ts3lf',
          fullName: 'Oswell E. Spencer',
          picture: 'https://www.umbrella.com/pictures/spencer.png',
          emails: [
            {
              address: 'oswellspencer@umbrella.com',
              isVerified: true,
              isPrimary: true,
            },
          ],
        }),
      ]);

      const PermissionModel = ctx.db.model('Permission');
      const requiredPermission = await PermissionModel.findOne({ name: 'yeep.user.write' });
      permissionAssignment = await createPermissionAssignment(ctx, {
        userId: superuser.id,
        orgId: null,
        permissionId: requiredPermission.id,
      });

      superuserSession = await createSession(ctx, {
        username: 'oswell',
        password: 'our-business-$s-l1f3-1ts3lf',
      });
    });

    afterAll(async () => {
      await destroySession(ctx, superuserSession);
      await deletePermissionAssignment(ctx, permissionAssignment);
      await deleteUser(ctx, wile);
      await deleteUser(ctx, superuser);
    });

    test('initiates verify email process and returns expected response for any user', async () => {
      const f = jest.fn();
      ctx.bus.once('email_verification_init', f);

      const startDate = new Date();
      let res = await request(server)
        .post('/api/user.verifyEmail')
        .set('Authorization', `Bearer ${superuserSession.accessToken}`)
        .send({
          id: wile.id,
          emailAddress: unverifiedEmail.address,
        });
      const endDate = new Date();

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
      });

      expect(f).toHaveBeenCalledWith({
        user: expect.objectContaining({
          id: expect.any(String),
          fullName: expect.any(String),
          emailAddress: unverifiedEmail.address,
          picture: expect.any(String),
        }),
        token: expect.objectContaining({
          id: expect.any(String),
          secret: expect.any(String),
          type: 'EMAIL_VERIFICATION',
          createdAt: expect.any(Date),
          expiresAt: expect.any(Date),
        }),
      });

      expect(
        isWithinRange(
          f.mock.calls[0][0].token.expiresAt,
          startDate,
          addSeconds(endDate, 4 * 60 * 60)
        )
      ).toEqual(true);
    });
  });
});
