/* eslint-env jest */
import request from 'supertest';
import isWithinRange from 'date-fns/is_within_range';
import addSeconds from 'date-fns/add_seconds';
import server from '../../../server';
import config from '../../../../yeep.config';
import deleteUser from '../../user/delete/service';
import createUser from '../../user/create/service';
import deletePermissionAssignment from '../../user/revokePermission/service';
import destroySessionToken from '../../session/destroy/service';
import createSessionToken from '../../session/create/service';
import createPermissionAssignment from '../../user/assignPermission/service';
import createOrg from '../../org/create/service';
import deleteOrg from '../../org/delete/service';

describe('api/v1/invitation.create', () => {
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
        .post('/api/v1/invitation.create')
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
    let org;
    let requestor;
    let permissionAssignment;
    let session;

    beforeAll(async () => {
      requestor = await createUser(ctx.db, {
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

      org = await createOrg(ctx.db, {
        name: 'Acme Inc',
        slug: 'acme',
        adminId: requestor.id,
      });

      const PermissionModel = ctx.db.model('Permission');
      const permission = await PermissionModel.findOne({
        name: 'yeep.invitation.write',
      });
      permissionAssignment = await createPermissionAssignment(ctx.db, {
        userId: requestor.id,
        orgId: null, // global scope
        permissionId: permission.id,
      });

      session = await createSessionToken(ctx, {
        username: 'wile',
        password: 'catch-the-b1rd$',
      });
    });

    afterAll(async () => {
      await destroySessionToken(ctx.db, session);
      await deletePermissionAssignment(ctx.db, permissionAssignment);
      await deleteUser(ctx.db, requestor);
      await deleteOrg(ctx.db, org);
    });

    test('invites user via email', async () => {
      const f = jest.fn();
      ctx.bus.once('invite_user', f);

      const startDate = new Date();
      const res = await request(server)
        .post('/api/v1/invitation.create')
        .set('Authorization', `Bearer ${session.accessToken}`)
        .send({
          user: 'beep-beep@acme.com',
          org: org.id,
          tokenExpiresInSeconds: 4 * 60 * 60, // i.e. 4 hours
        });
      const endDate = new Date();

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
      });

      expect(f).toHaveBeenCalledWith({
        invitee: expect.objectContaining({
          emailAddress: 'beep-beep@acme.com',
        }),
        inviter: expect.objectContaining({
          id: expect.any(String),
          fullName: 'Wile E. Coyote',
          picture: 'https://www.acme.com/pictures/coyote.png',
          emailAddress: 'coyote@acme.com',
        }),
        token: expect.objectContaining({
          id: expect.any(String),
          secret: expect.any(String),
          type: 'INVITATION',
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

    test('returns error when `orgId` is unknown', async () => {
      const res = await request(server)
        .post('/api/v1/invitation.create')
        .set('Authorization', `Bearer ${session.accessToken}`)
        .send({
          user: 'beep-beep@acme.com',
          org: '507f1f77bcf86cd799439012', // i.e. some random ID
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10011,
          message: 'Org "507f1f77bcf86cd799439012" does not exist',
        },
      });
    });

    test('returns error when `permissions` array contains unknown permissionId', async () => {
      const res = await request(server)
        .post('/api/v1/invitation.create')
        .set('Authorization', `Bearer ${session.accessToken}`)
        .send({
          user: 'beep-beep@acme.com',
          org: org.id,
          permissions: [
            {
              id: '507f1f77bcf86cd799439012', // some random ID
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10008,
          message: 'Permission "507f1f77bcf86cd799439012" does not exist',
        },
      });
    });

    test('returns error when a supplied permission does not match org scope', async () => {
      const PermissionModel = ctx.db.model('Permission');
      const permission = await PermissionModel.findOne({
        name: 'yeep.user.write',
      });

      const res = await request(server)
        .post('/api/v1/invitation.create')
        .set('Authorization', `Bearer ${session.accessToken}`)
        .send({
          user: 'beep-beep@acme.com',
          org: org.id,
          permissions: [
            {
              id: permission._id.toHexString(),
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10011,
          message: `Permission "${permission._id.toHexString()}" cannot be assigned to the designated org`,
        },
      });
    });

    test('returns error when `roles` array contains unknown roleId', async () => {
      const res = await request(server)
        .post('/api/v1/invitation.create')
        .set('Authorization', `Bearer ${session.accessToken}`)
        .send({
          user: 'beep-beep@acme.com',
          org: org.id,
          roles: [
            {
              id: '507f1f77bcf86cd799439012', // some random ID
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10017,
          message: 'Role "507f1f77bcf86cd799439012" does not exist',
        },
      });
    });

    test('returns error when a supplied role does not match org scope', async () => {
      const RoleModel = ctx.db.model('Role');
      const role = await RoleModel.findOne({
        name: 'admin',
      });

      const res = await request(server)
        .post('/api/v1/invitation.create')
        .set('Authorization', `Bearer ${session.accessToken}`)
        .send({
          user: 'beep-beep@acme.com',
          org: org.id,
          roles: [
            {
              id: role._id.toHexString(),
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10019,
          message: `Role "${role._id.toHexString()}" cannot be assigned to the designated org`,
        },
      });
    });

    describe('isUsernameEnabled = false', () => {
      beforeAll(async () => {
        ctx.config.isUsernameEnabled = false;
      });

      afterAll(async () => {
        ctx.config.isUsernameEnabled = true;
      });

      test('returns error when userKey is username', async () => {
        const res = await request(server)
          .post('/api/v1/invitation.create')
          .set('Authorization', `Bearer ${session.accessToken}`)
          .send({
            user: 'runner',
            org: org.id,
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
        expect(res.body.error.details[0].path).toEqual(['user']);
        expect(res.body.error.details[0].type).toBe('string.email');
      });
    });
  });
});
