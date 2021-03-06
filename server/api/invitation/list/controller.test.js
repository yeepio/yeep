/* eslint-env jest */
import request from 'supertest';
import { ObjectId } from 'mongodb';
import addSeconds from 'date-fns/add_seconds';
import server from '../../../server';
import config from '../../../../yeep.config';
import createUser from '../../user/create/service';
import createOrg from '../../org/create/service';
import { createSession, signBearerJWT } from '../../session/issueToken/service';
import { destroySession } from '../../session/destroyToken/service';
import deleteOrg from '../../org/delete/service';
import deleteUser from '../../user/delete/service';
import createPermissionAssignment from '../../user/assignPermission/service';
import deletePermissionAssignment from '../../user/revokePermission/service';
// import createPermission from '../../permission/create/service';
// import createRole from '../create/service';
// import deleteRole from '../delete/service';
// import deletePermission from '../../permission/delete/service';

describe('api/invitation.list', () => {
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
        .post('/api/invitation.list')
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
    let wile;
    let acme;
    let wileSession;
    let wileBearerToken;
    let runner;
    let runnerSession;
    // let runnerBearerToken;
    let permission;
    let role;

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

      acme = await createOrg(ctx, {
        name: 'Acme Inc',
        slug: 'acme',
        adminId: wile.id,
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

      runnerSession = await createSession(ctx, {
        username: 'runner',
        password: 'fast+furry-ous',
      });
      // runnerBearerToken = await signBearerJWT(ctx, runnerSession);

      const PermissionModel = ctx.db.model('Permission');
      permission = await PermissionModel.findOne({
        name: 'yeep.invitation.read',
      });

      const RoleModel = ctx.db.model('Role');
      role = await RoleModel.findOne({
        name: 'admin',
      });

      // create user invitation(s)
      const InvitationTokenModel = ctx.db.model('InvitationToken');
      await InvitationTokenModel.create([
        {
          secret: InvitationTokenModel.generateSecret({ length: 24 }),
          invitee: {
            roles: [
              {
                id: role._id.toHexString(),
              },
            ],
            permissions: [],
            emailAddress: 'beep-beep@acme.com',
          },
          user: null,
          org: null,
          expiresAt: addSeconds(new Date(), 60), // i.e. in 1 minute
        },
        {
          secret: InvitationTokenModel.generateSecret({ length: 24 }),
          invitee: {
            roles: [],
            permissions: [
              {
                id: permission._id.toHexString(),
              },
            ],
            emailAddress: 'beep-beep@acme.com',
          },
          user: null,
          org: ObjectId(acme.id),
          expiresAt: addSeconds(new Date(), 60), // i.e. in 1 minute
        },
        {
          secret: InvitationTokenModel.generateSecret({ length: 24 }),
          invitee: {
            roles: [
              {
                id: role._id.toHexString(),
              },
            ],
            permissions: [],
            emailAddress: 'coyote@acme.com',
          },
          user: ObjectId(runner.id),
          org: ObjectId(acme.id),
          expiresAt: addSeconds(new Date(), 60), // i.e. in 1 minute
        },
      ]);
    });

    afterAll(async () => {
      await destroySession(ctx, wileSession);
      await destroySession(ctx, runnerSession);
      await deleteUser(ctx, wile);
      await deleteUser(ctx, runner);
      await deleteOrg(ctx, acme);
    });

    describe('with global `yeep.invitation.list` permission', () => {
      let permissionAssignment;

      beforeAll(async () => {
        permissionAssignment = await createPermissionAssignment(ctx, {
          userId: wile.id,
          orgId: null, // global scope
          permissionId: permission.id,
        });
      });

      afterAll(async () => {
        await deletePermissionAssignment(ctx, permissionAssignment);
      });

      test('returns list of invitations', async () => {
        const res = await request(server)
          .post('/api/invitation.list')
          .set('Authorization', `Bearer ${wileBearerToken}`)
          .send();

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
          ok: true,
          invitations: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              token: expect.any(String),
              user: expect.any(Object),
              org: expect.any(Object),
              roles: expect.any(Array),
              permissions: expect.any(Array),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
              expiresAt: expect.any(String),
            }),
          ]),
        });

        res.body.invitations.forEach((invitation) => {
          invitation.permissions.forEach((permission) => {
            expect(permission).toMatchObject({
              id: expect.any(String),
            });
          });
          invitation.roles.forEach((role) => {
            expect(role).toMatchObject({
              id: expect.any(String),
            });
          });
        });
      });

      test('limits number of invitations using `limit` param', async () => {
        const res = await request(server)
          .post('/api/invitation.list')
          .set('Authorization', `Bearer ${wileBearerToken}`)
          .send({
            limit: 1,
          });

        expect(res.status).toBe(200);
        expect(res.body.invitations.length).toBe(1);
      });

      test('paginates through invitations using `cursor` param', async () => {
        const res = await request(server)
          .post('/api/invitation.list')
          .set('Authorization', `Bearer ${wileBearerToken}`)
          .send({
            limit: 2,
          });
        expect(res.body).toMatchObject({
          ok: true,
        });
        expect(res.body.invitations.length).toBe(2);

        const res1 = await request(server)
          .post('/api/invitation.list')
          .set('Authorization', `Bearer ${wileBearerToken}`)
          .send({
            limit: 1,
          });
        expect(res1.body).toMatchObject({
          ok: true,
          nextCursor: expect.any(String),
        });
        expect(res1.body.invitations.length).toBe(1);
        expect(res1.body.invitations[0]).toEqual(res.body.invitations[0]);

        const res2 = await request(server)
          .post('/api/invitation.list')
          .set('Authorization', `Bearer ${wileBearerToken}`)
          .send({
            limit: 1,
            cursor: res1.body.nextCursor,
          });
        expect(res2.body).toMatchObject({
          ok: true,
        });
        expect(res2.body.invitations.length).toBe(1);
        expect(res2.body.invitations[0]).toEqual(res.body.invitations[1]);
      });

      test('filters invitations using `user` param', async () => {
        const res = await request(server)
          .post('/api/invitation.list')
          .set('Authorization', `Bearer ${wileBearerToken}`)
          .send({
            user: runner.id,
          });
        expect(res.body).toMatchObject({
          ok: true,
          invitations: expect.arrayContaining([
            expect.objectContaining({
              user: expect.objectContaining({
                id: runner.id,
              }),
            }),
          ]),
        });
        expect(res.body.invitations.length).toBe(1);
      });
    });

    describe('with org scoped `yeep.invitation.list` permission', () => {
      test('filters invitations using `org` param', async () => {
        const res = await request(server)
          .post('/api/invitation.list')
          .set('Authorization', `Bearer ${wileBearerToken}`)
          .send({
            org: acme.id,
          });
        expect(res.body).toMatchObject({
          ok: true,
          invitations: expect.arrayContaining([
            expect.objectContaining({
              org: expect.objectContaining({
                id: acme.id,
              }),
            }),
          ]),
        });
        expect(res.body.invitations.length).toBe(2);
      });

      test('filters invitations using `user` + `org` params', async () => {
        const res = await request(server)
          .post('/api/invitation.list')
          .set('Authorization', `Bearer ${wileBearerToken}`)
          .send({
            user: runner.id,
            org: acme.id,
          });
        expect(res.body).toMatchObject({
          ok: true,
          invitations: expect.arrayContaining([
            expect.objectContaining({
              user: expect.objectContaining({
                id: runner.id,
              }),
              org: expect.objectContaining({
                id: acme.id,
              }),
            }),
          ]),
        });
        expect(res.body.invitations.length).toBe(1);
      });
    });
  });
});
