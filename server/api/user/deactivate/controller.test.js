/* eslint-env jest */
import request from 'supertest';
import isWithinRange from 'date-fns/is_within_range';
import addSeconds from 'date-fns/add_seconds';
import server from '../../../server';
import config from '../../../../yeep.config';
import createOrg from '../../org/create/service';
import createUser from '../create/service';
import createPermissionAssignment from '../assignPermission/service';
import { createSession, signBearerJWT } from '../../session/issueToken/service';
import { destroySession } from '../../session/destroyToken/service';
import deletePermissionAssignment from '../revokePermission/service';
import deleteUser from '../delete/service';
import deleteOrg from '../../org/delete/service';

describe('api/user.deactivate', () => {
  let ctx;

  beforeAll(async () => {
    await server.setup(config);
    ctx = server.getAppContext();
  });

  afterAll(async () => {
    await server.teardown();
  });

  describe('unauthorized user', () => {
    test('throws authentication error', async () => {
      const res = await request(server)
        .post('/api/user.deactivate')
        .send();
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10000,
          message: 'Access denied; invalid or missing credentials',
        },
      });
    });
  });

  describe('authorized user', () => {
    let acme;
    let runner;
    let wile;
    let permissionAssignment;
    let wileSession;
    let runnerSession;
    let wileBearerToken;
    let runnerBearerToken;

    beforeAll(async () => {
      wile = await createUser(ctx, {
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
      const permission = await PermissionModel.findOne({
        name: 'yeep.user.write',
      });
      permissionAssignment = await createPermissionAssignment(ctx, {
        userId: wile.id,
        permissionId: permission.id,
        // global org
      });

      wileSession = await createSession(ctx, {
        username: 'wile',
        password: 'catch-the-b1rd$',
      });
      wileBearerToken = await signBearerJWT(ctx, wileSession);

      runner = await createUser(ctx, {
        username: 'runner',
        password: 'fast+furry-ous',
        fullName: 'Road Runner',
        picture: 'https://www.acme.com/pictures/roadrunner.png',
        emails: [
          {
            address: 'beep-beep@acme.com',
            isVerified: true,
            isPrimary: true,
          },
        ],
      });

      acme = await createOrg(ctx, {
        name: 'Acme Inc',
        slug: 'acme',
        adminId: runner.id,
      });

      runnerSession = await createSession(ctx, {
        username: 'runner',
        password: 'fast+furry-ous',
      });
      runnerBearerToken = await signBearerJWT(ctx, runnerSession);
    });

    afterAll(async () => {
      await destroySession(ctx, wileSession);
      await destroySession(ctx, runnerSession);
      await deletePermissionAssignment(ctx, permissionAssignment);
      await deleteUser(ctx, wile);
      await deleteUser(ctx, runner);
      await deleteOrg(ctx, acme);
    });

    test('deactivates user and returns expected response', async () => {
      const startDate = new Date();
      let res = await request(server)
        .post('/api/user.deactivate')
        .set('Authorization', `Bearer ${wileBearerToken}`)
        .send({
          id: runner.id,
        });
      const endDate = new Date();

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
        user: expect.objectContaining({
          id: expect.any(String),
          deactivatedAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      });

      expect(isWithinRange(res.body.user.deactivatedAt, startDate, endDate)).toEqual(true);

      // deactivated user cannot login
      res = await request(server)
        .post('/api/session.issueToken')
        .send({
          user: 'runner',
          password: 'fast+furry-ous',
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: false,
          error: {
            code: 10022,
            message: 'User "runner" is deactivated',
          },
        })
      );

      // deactivated user cannot use active session token
      res = await request(server)
        .post('/api/user.info')
        .set('Authorization', `Bearer ${runnerBearerToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: false,
        })
      );
    });

    test('deactivates user after the designated time and returns expected response', async () => {
      const startDate = new Date();
      let res = await request(server)
        .post('/api/user.deactivate')
        .set('Authorization', `Bearer ${wileBearerToken}`)
        .send({
          id: runner.id,
          deactivateAfterSeconds: 3600, // deactivate after 1 hour, i.e. 3600 seconds
        });
      const endDate = new Date();

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
        user: expect.objectContaining({
          id: expect.any(String),
          deactivatedAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      });

      expect(
        isWithinRange(
          res.body.user.deactivatedAt,
          addSeconds(startDate, 3600),
          addSeconds(endDate, 3600)
        )
      ).toEqual(true);

      // runner can login for the next hour
      res = await request(server)
        .post('/api/session.issueToken')
        .send({
          user: 'runner',
          password: 'fast+furry-ous',
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: true,
        })
      );

      // user can use active session token for the next hour
      res = await request(server)
        .post('/api/user.info')
        .set('Authorization', `Bearer ${runnerBearerToken}`)
        .send({
          id: runner.id,
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: true,
        })
      );
    });

    test('returns error when `id` contains invalid characters', async () => {
      const res = await request(server)
        .post('/api/user.deactivate')
        .set('Authorization', `Bearer ${wileBearerToken}`)
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
        .post('/api/user.deactivate')
        .set('Authorization', `Bearer ${wileBearerToken}`)
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
        .post('/api/user.deactivate')
        .set('Authorization', `Bearer ${wileBearerToken}`)
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
        .post('/api/user.deactivate')
        .set('Authorization', `Bearer ${wileBearerToken}`)
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
        .post('/api/user.deactivate')
        .set('Authorization', `Bearer ${wileBearerToken}`)
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

    test('returns error with invalid permission scope', async () => {
      const res = await request(server)
        .post('/api/user.deactivate')
        .set('Authorization', `Bearer ${runnerBearerToken}`)
        .send({
          id: wile.id,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10012,
          message: `User ${runner.id} does not have sufficient permissions to access this resource`,
        },
      });
    });
  });
});
