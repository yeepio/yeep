/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import config from '../../../../yeep.config';
import createUser from '../../user/create/service';
import deleteUser from '../../user/delete/service';
import createOrg from '../../org/create/service';
import deleteOrg from '../../org/delete/service';
import createPermissionAssignment from '../../user/assignPermission/service';
import createPermission from '../../permission/create/service';
import deletePermission from '../../permission/delete/service';
import deletePermissionAssignment from '../../user/revokePermission/service';
import { PASSWORD } from '../../../constants/authFactorTypes';
import jwt from '../../../utils/jwt';

describe('api/session.issueToken', () => {
  let ctx;

  beforeAll(async () => {
    await server.setup(config);
    ctx = server.getAppContext();
  });

  afterAll(async () => {
    await server.teardown();
  });

  describe('basic user', () => {
    let wileUser;

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
    });

    afterAll(async () => {
      await deleteUser(ctx, wileUser);
    });

    test('returns error when username is invalid', async () => {
      const res = await request(server)
        .post('/api/session.issueToken')
        .send({
          user: 'a',
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
        .post('/api/session.issueToken')
        .send({
          user: 'unknown@email.com',
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
        .post('/api/session.issueToken')
        .send({
          user: 'notuser',
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
        .post('/api/session.issueToken')
        .send({
          user: 'wile',
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
        .post('/api/session.issueToken')
        .send({
          user: 'Wile', // this will be automaticaly lower-cased
          password: 'catch-the-b1rd$',
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: true,
          token: expect.any(String),
          expiresAt: expect.any(String),
        })
      );
    });

    test('creates new session with email address + password', async () => {
      const res = await request(server)
        .post('/api/session.issueToken')
        .send({
          user: 'coyote@acme.com',
          password: 'catch-the-b1rd$',
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: true,
          token: expect.any(String),
          expiresAt: expect.any(String),
        })
      );
    });

    test('adds user profile data to token payload by default', async () => {
      const res = await request(server)
        .post('/api/session.issueToken')
        .send({
          user: 'Wile', // this will be automaticaly lower-cased
          password: 'catch-the-b1rd$',
        });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);

      const tokenPayload = await jwt.verifyAsync(res.body.token, ctx.config.session.bearer.secret);
      expect(tokenPayload).toEqual(
        expect.objectContaining({
          user: {
            id: expect.any(String),
            username: 'wile',
            fullName: 'Wile E. Coyote',
            picture: 'https://www.acme.com/pictures/coyote.png',
            primaryEmail: 'coyote@acme.com',
          },
        })
      );
    });

    test('does not add user profile data to token payload when `projection.profile` is false', async () => {
      const res = await request(server)
        .post('/api/session.issueToken')
        .send({
          user: 'Wile', // this will be automaticaly lower-cased
          password: 'catch-the-b1rd$',
          projection: {
            profile: false,
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);

      const payload = await jwt.verifyAsync(res.body.token, ctx.config.session.bearer.secret);
      expect(payload).toEqual(
        expect.objectContaining({
          user: {
            id: expect.any(String),
          },
        })
      );
      expect(payload.user.username).toBeUndefined();
      expect(payload.user.fullName).toBeUndefined();
      expect(payload.user.picture).toBeUndefined();
      expect(payload.user.primaryEmail).toBeUndefined();
    });
  });

  describe('user with explicit permissions', () => {
    let wileUser;
    let acmeOrg;
    let testPermission;
    let testPermissionAssignment;

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

      acmeOrg = await createOrg(ctx, {
        name: 'Acme Inc',
        slug: 'acme',
        adminId: wileUser.id,
      });

      testPermission = await createPermission(ctx, {
        name: 'acme.test',
        description: 'Test permission',
        projection: acmeOrg.id,
      });

      testPermissionAssignment = await createPermissionAssignment(ctx, {
        userId: wileUser.id,
        orgId: acmeOrg.id,
        permissionId: testPermission.id,
      });
    });

    afterAll(async () => {
      await deletePermissionAssignment(ctx, testPermissionAssignment);
      await deleteUser(ctx, wileUser);
      await deleteOrg(ctx, acmeOrg);
      await deletePermission(ctx, testPermission);
    });

    test('adds permissions to token payload when `projection.permissions` is true', async () => {
      const res = await request(server)
        .post('/api/session.issueToken')
        .send({
          user: 'Wile', // this will be automaticaly lower-cased
          password: 'catch-the-b1rd$',
          projection: {
            profile: false,
            permissions: true,
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);

      const tokenPayload = await jwt.verifyAsync(res.body.token, ctx.config.session.bearer.secret);
      expect(tokenPayload).toEqual(
        expect.objectContaining({
          user: {
            id: expect.any(String),
            permissions: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(String),
                name: expect.any(String),
                isSystemPermission: expect.any(Boolean),
                orgId: acmeOrg.id,
              }),
            ]),
          },
        })
      );
    });

    test('does not add permissions to token payload by default', async () => {
      const res = await request(server)
        .post('/api/session.issueToken')
        .send({
          user: 'Wile', // this will be automaticaly lower-cased
          password: 'catch-the-b1rd$',
        });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);

      const tokenPayload = await jwt.verifyAsync(res.body.token, ctx.config.session.bearer.secret);
      expect(tokenPayload).toEqual(
        expect.objectContaining({
          user: expect.objectContaining({
            id: expect.any(String),
          }),
        })
      );
      expect(tokenPayload.user.permissions).toBeUndefined();
    });
  });

  describe('user with MFA', () => {
    let wileUser;

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

      const TOTPModel = ctx.db.model('TOTP');
      await TOTPModel.create({
        user: wileUser.id,
        secret: 'N34CXTAEDWWIETTGN7P7HGFVM2CPGAG2',
      });
    });

    afterAll(async () => {
      await deleteUser(ctx, wileUser);
    });

    test('returns error when secondary auth factor is undefined', async () => {
      const res = await request(server)
        .post('/api/session.issueToken')
        .send({
          user: 'wile',
          password: 'catch-the-b1rd$',
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10034,
          message: expect.any(String),
          applicableAuthFactorTypes: ['TOTP'],
        },
      });
    });

    test('does not accept password as secondary auth factor', async () => {
      const res = await request(server)
        .post('/api/session.issueToken')
        .send({
          user: 'wile',
          password: 'catch-the-b1rd$',
          secondaryAuthFactor: {
            type: PASSWORD,
            token: 'catch-the-b1rd$',
          },
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
      expect(res.body.error.details[0].path).toEqual(['secondaryAuthFactor', 'type']);
      expect(res.body.error.details[0].type).toBe('any.allowOnly');
    });

    test('creates new session when secondary auth factor is valid', async () => {
      const TOTPModel = ctx.db.model('TOTP');

      const res = await request(server)
        .post('/api/session.issueToken')
        .send({
          user: 'wile',
          password: 'catch-the-b1rd$',
          secondaryAuthFactor: {
            type: 'TOTP',
            token: TOTPModel.getToken('N34CXTAEDWWIETTGN7P7HGFVM2CPGAG2', 0),
          },
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: true,
          token: expect.any(String),
          expiresAt: expect.any(String),
        })
      );
    });
  });
});
