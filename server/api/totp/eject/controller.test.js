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
import createPermissionAssignment from '../../user/assignPermission/service';
import deletePermissionAssignment from '../../user/revokePermission/service';

describe('api/totp.eject', () => {
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
        .post('/api/totp.eject')
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

    test('returns error when `userId` body param is undefined', async () => {
      const res = await request(server)
        .post('/api/totp.eject')
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
      expect(res.body.error.details[0].path).toEqual(['userId']);
      expect(res.body.error.details[0].type).toBe('any.required');
    });

    test('returns error if user is not already enrolled to TOTP', async () => {
      const res = await request(server)
        .post('/api/totp.eject')
        .set('Authorization', `Bearer ${wileSession.accessToken}`)
        .send({
          userId: wileUser.id,
          secondaryAuthFactor: {
            type: 'PASSWORD',
            token: 'catch-the-b1rd$',
          },
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10033,
          message: `User ${wileUser.id} is not enrolled to TOTP authentication`,
        },
      });
    });

    test('returns error when `secondaryAuthFactor` is undefined', async () => {
      const TOTPModel = ctx.db.model('TOTP');
      const secret = TOTPModel.generateSecret();
      await TOTPModel.create({
        user: wileUser.id,
        secret,
      });

      const res = await request(server)
        .post('/api/totp.eject')
        .set('Authorization', `Bearer ${wileSession.accessToken}`)
        .send({
          userId: wileUser.id,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10034,
          message: `User ${
            wileUser.id
          } has enabled MFA; please specify secondary authentication factor`,
          applicableAuthFactorTypes: expect.arrayContaining(['PASSWORD', 'TOTP']),
        },
      });

      await TOTPModel.deleteOne({
        user: wileUser.id,
      });
    });

    test('removes TOTP from user using PASSWORD as secondary authentication factor', async () => {
      const TOTPModel = ctx.db.model('TOTP');
      const secret = TOTPModel.generateSecret();
      await TOTPModel.create({
        user: wileUser.id,
        secret,
      });

      const res = await request(server)
        .post('/api/totp.eject')
        .set('Authorization', `Bearer ${wileSession.accessToken}`)
        .send({
          userId: wileUser.id,
          secondaryAuthFactor: {
            type: 'PASSWORD',
            token: 'catch-the-b1rd$',
          },
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
      });
    });

    test('removes TOTP from user using TOTP as secondary authentication factor', async () => {
      const TOTPModel = ctx.db.model('TOTP');
      const secret = TOTPModel.generateSecret();
      await TOTPModel.create({
        user: wileUser.id,
        secret,
      });

      const res = await request(server)
        .post('/api/totp.eject')
        .set('Authorization', `Bearer ${wileSession.accessToken}`)
        .send({
          userId: wileUser.id,
          secondaryAuthFactor: {
            type: 'TOTP',
            token: TOTPModel.getToken(secret, 0),
          },
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
      });
    });
  });

  describe('superuser', () => {
    let suUser;
    let suSession;
    let permissionAssignment;
    let wileUser;

    beforeAll(async () => {
      suUser = await createUser(ctx, {
        username: 'gl@d0s',
        password: 'h3r3-w3-g0-@g@1n',
        fullName: 'GLaDOS',
        picture: 'https://www.apperture.com/pictures/glados.png',
        emails: [
          {
            address: 'admin@apperture.com',
            isVerified: true,
            isPrimary: true,
          },
        ],
      });

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

      const PermissionModel = ctx.db.model('Permission');
      const requiredPermission = await PermissionModel.findOne({ name: 'yeep.user.write' });
      permissionAssignment = await createPermissionAssignment(ctx, {
        userId: suUser.id,
        orgId: null,
        permissionId: requiredPermission.id,
      });

      suSession = await createSession(ctx, {
        username: 'gl@d0s',
        password: 'h3r3-w3-g0-@g@1n',
      });
    });

    afterAll(async () => {
      await destroySession(ctx, suSession);
      await deletePermissionAssignment(ctx, permissionAssignment);
      await deleteUser(ctx, wileUser);
      await deleteUser(ctx, suUser);
    });

    test('does not need secondary authentication factor to remove TOTP from user', async () => {
      const TOTPModel = ctx.db.model('TOTP');
      const secret = TOTPModel.generateSecret();
      await TOTPModel.create({
        user: wileUser.id,
        secret,
      });

      const res = await request(server)
        .post('/api/totp.eject')
        .set('Authorization', `Bearer ${suSession.accessToken}`)
        .send({
          userId: wileUser.id,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
      });
    });
  });
});
