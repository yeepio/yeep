/* eslint-env jest */
import request from 'supertest';
import { event } from 'awaiting';
import server from '../../../server';
import config from '../../../../yeep.config';
import createUser from '../../user/create/service';
import deleteUser from '../../user/delete/service';
import createInvitation from '../create/service';
import createOrg from '../../org/create/service';
import createPermissionAssignment from '../../user/assignPermission/service';
import deletePermissionAssignment from '../../user/revokePermission/service';
import deleteOrg from '../../org/delete/service';
import createSession from '../../session/create/service';
import destroySession from '../../session/destroy/service';

describe('api/invitation.accept', () => {
  let ctx;

  beforeAll(async () => {
    await server.setup(config);
    ctx = server.getAppContext();
  });

  afterAll(async () => {
    await server.teardown();
  });

  describe('unauthorized user', () => {
    let wile;
    let org;
    let permissionAssignment;

    beforeAll(async () => {
      wile = await createUser(ctx.db, {
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
        adminId: wile.id,
      });

      const PermissionModel = ctx.db.model('Permission');
      const permission = await PermissionModel.findOne({
        name: 'yeep.user.write',
      });
      permissionAssignment = await createPermissionAssignment(ctx.db, {
        userId: wile.id,
        orgId: null, // global scope
        permissionId: permission.id,
      });
    });

    afterAll(async () => {
      await deletePermissionAssignment(ctx.db, permissionAssignment);
      await deleteUser(ctx.db, wile);
      await deleteOrg(ctx.db, org);
    });

    test('returns error when token contains less than 6 characters', async () => {
      const res = await request(server)
        .post('/api/invitation.accept')
        .send({
          token: 'abcde',
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

    test('returns error when token is unknown', async () => {
      const res = await request(server)
        .post('/api/invitation.accept')
        .send({
          token: 'abcdef',
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10027,
          message: 'Token does not exist or has already expired',
        },
      });
    });

    describe('invitation token NOT exclusive to specific user', () => {
      let token;

      beforeAll(async () => {
        const UserModel = ctx.db.model('User');
        const eventTrigger = event(ctx.bus, 'invite_user');

        await createInvitation(ctx.db, ctx.bus, {
          inviteeEmailAddress: 'beep-beep@acme.com',
          orgId: org.id,
          inviterId: wile.id,
          inviterUsername: wile.username,
          inviterFullName: wile.fullName,
          inviterPicture: wile.picture,
          inviterEmailAddress: UserModel.getPrimaryEmailAddress(wile.emails),
        });

        const data = await eventTrigger;
        token = data[0].token.secret;
      });

      test('returns error when username is missing', async () => {
        const res = await request(server)
          .post('/api/invitation.accept')
          .send({
            token,
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
        expect(res.body.error.details[0].path).toEqual(['username']);
        expect(res.body.error.details[0].type).toBe('any.required');
      });

      test('returns error when password is missing', async () => {
        const res = await request(server)
          .post('/api/invitation.accept')
          .send({
            token,
            username: 'runner',
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
        expect(res.body.error.details[0].path).toEqual(['password']);
        expect(res.body.error.details[0].type).toBe('any.required');
      });

      test('returns error when fullName is missing', async () => {
        const res = await request(server)
          .post('/api/invitation.accept')
          .send({
            token,
            username: 'runner',
            password: 'fast+furry-ous',
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
        expect(res.body.error.details[0].path).toEqual(['fullName']);
        expect(res.body.error.details[0].type).toBe('any.required');
      });

      test('creates new user, joins org and returns expected response', async () => {
        const f = jest.fn();
        ctx.bus.once('join_user', f);

        const res = await request(server)
          .post('/api/invitation.accept')
          .send({
            token,
            username: 'runner',
            password: 'fast+furry-ous',
            fullName: 'Road Runner',
            picture: 'https://www.acme.com/pictures/runner.png',
          });

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
          ok: true,
          user: {
            id: expect.any(String),
            updatedAt: expect.any(String),
          },
        });

        const isUserDeleted = await deleteUser(ctx.db, res.body.user);
        expect(isUserDeleted).toBe(true);

        expect(f).toHaveBeenCalledWith({
          user: expect.objectContaining({
            id: expect.any(String),
            username: expect.any(String),
            fullName: expect.any(String),
            emails: expect.any(Array),
          }),
          org: expect.objectContaining({
            id: expect.any(String),
          }),
        });
      });
    });

    describe('invitation token exclusive to specific user', () => {
      let token;
      let runner;

      beforeAll(async () => {
        runner = await createUser(ctx.db, {
          username: 'runner',
          password: 'fast+furry-ous',
          fullName: 'Road Runner',
          picture: 'https://www.acme.com/pictures/runner.png',
          emails: [
            {
              address: 'beep-beep@acme.com',
              isVerified: true,
              isPrimary: true,
            },
          ],
        });
      });

      afterAll(async () => {
        await deleteUser(ctx.db, runner);
      });

      test('returns authorization error', async () => {
        const UserModel = ctx.db.model('User');
        const eventTrigger = event(ctx.bus, 'invite_user');

        await createInvitation(ctx.db, ctx.bus, {
          inviteeEmailAddress: 'beep-beep@acme.com',
          orgId: org.id,
          inviterId: wile.id,
          inviterUsername: wile.username,
          inviterFullName: wile.fullName,
          inviterPicture: wile.picture,
          inviterEmailAddress: UserModel.getPrimaryEmailAddress(wile.emails),
        });

        const data = await eventTrigger;
        token = data[0].token.secret;

        const res = await request(server)
          .post('/api/invitation.accept')
          .send({
            token,
          });

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
          ok: false,
          error: {
            code: 10012,
            message: `Invitation token "${token}" is exclusive to an authenticated user; please login and retry`,
          },
        });
      });
    });
  });

  describe('authorized user', () => {
    let wile;
    let org;
    let permissionAssignment;
    let wileSession;

    beforeAll(async () => {
      wile = await createUser(ctx.db, {
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
        adminId: wile.id,
      });

      const PermissionModel = ctx.db.model('Permission');
      const permission = await PermissionModel.findOne({
        name: 'yeep.user.write',
      });
      permissionAssignment = await createPermissionAssignment(ctx.db, {
        userId: wile.id,
        orgId: null, // global scope
        permissionId: permission.id,
      });

      wileSession = await createSession(ctx, {
        username: 'wile',
        password: 'catch-the-b1rd$',
      });
    });

    afterAll(async () => {
      await destroySession(ctx, wileSession);
      await deletePermissionAssignment(ctx.db, permissionAssignment);
      await deleteUser(ctx.db, wile);
      await deleteOrg(ctx.db, org);
    });

    test('returns error when authenticated user is already an org member', async () => {
      const UserModel = ctx.db.model('User');
      const eventTrigger = event(ctx.bus, 'invite_user');

      await createInvitation(ctx.db, ctx.bus, {
        inviteeEmailAddress: 'beep-beep@acme.com',
        orgId: org.id,
        inviterId: wile.id,
        inviterUsername: wile.username,
        inviterFullName: wile.fullName,
        inviterPicture: wile.picture,
        inviterEmailAddress: UserModel.getPrimaryEmailAddress(wile.emails),
      });

      const data = await eventTrigger;
      const token = data[0].token.secret;

      const res = await request(server)
        .post('/api/invitation.accept')
        .set('Authorization', `Bearer ${wileSession.accessToken}`)
        .send({
          token,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10028,
        },
      });
    });

    describe('invitation token NOT exclusive to specific user', () => {
      let token;
      let runner;
      let runnerSession;

      beforeAll(async () => {
        const UserModel = ctx.db.model('User');
        const eventTrigger = event(ctx.bus, 'invite_user');

        await createInvitation(ctx.db, ctx.bus, {
          inviteeEmailAddress: 'beep-beep@acme.com',
          orgId: org.id,
          inviterId: wile.id,
          inviterUsername: wile.username,
          inviterFullName: wile.fullName,
          inviterPicture: wile.picture,
          inviterEmailAddress: UserModel.getPrimaryEmailAddress(wile.emails),
        });

        const data = await eventTrigger;
        token = data[0].token.secret;

        runner = await createUser(ctx.db, {
          username: 'runner',
          password: 'fast+furry-ous',
          fullName: 'Road Runner',
          picture: 'https://www.acme.com/pictures/runner.png',
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
      });

      afterAll(async () => {
        await destroySession(ctx, runnerSession);
        await deleteUser(ctx.db, runner);
      });

      test('joins org with currently authenticated user and returns expected response', async () => {
        const f = jest.fn();
        ctx.bus.once('join_user', f);

        const res = await request(server)
          .post('/api/invitation.accept')
          .set('Authorization', `Bearer ${runnerSession.accessToken}`)
          .send({
            token,
          });

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
          ok: true,
          user: {
            id: expect.any(String),
            updatedAt: expect.any(String),
          },
        });

        expect(f).toHaveBeenCalledWith({
          user: expect.objectContaining({
            id: expect.any(String),
            username: expect.any(String),
            fullName: expect.any(String),
            emails: expect.any(Array),
          }),
          org: expect.objectContaining({
            id: expect.any(String),
          }),
        });
      });
    });

    describe('invitation token exclusive to specific user', () => {
      let token;
      let runner;
      let runnerSession;
      let porky;
      let porkySession;

      beforeAll(async () => {
        const UserModel = ctx.db.model('User');
        const eventTrigger = event(ctx.bus, 'invite_user');

        runner = await createUser(ctx.db, {
          username: 'runner',
          password: 'fast+furry-ous',
          fullName: 'Road Runner',
          picture: 'https://www.acme.com/pictures/runner.png',
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

        porky = await createUser(ctx.db, {
          username: 'porky',
          password: "Th-th-th-that's all folks!",
          fullName: 'Porky Pig',
          picture: 'https://www.acme.com/pictures/porky.png',
          emails: [
            {
              address: 'porky@acme.com',
              isVerified: true,
              isPrimary: true,
            },
          ],
        });

        porkySession = await createSession(ctx, {
          username: 'porky',
          password: "Th-th-th-that's all folks!",
        });

        await createInvitation(ctx.db, ctx.bus, {
          inviteeEmailAddress: 'beep-beep@acme.com',
          orgId: org.id,
          inviterId: wile.id,
          inviterUsername: wile.username,
          inviterFullName: wile.fullName,
          inviterPicture: wile.picture,
          inviterEmailAddress: UserModel.getPrimaryEmailAddress(wile.emails),
        });

        const data = await eventTrigger;
        token = data[0].token.secret;
      });

      afterAll(async () => {
        await destroySession(ctx, runnerSession);
        await deleteUser(ctx.db, runner);
        await destroySession(ctx, porkySession);
        await deleteUser(ctx.db, porky);
      });

      test('joins org with currently authenticated user and returns expected response', async () => {
        const f = jest.fn();
        ctx.bus.once('join_user', f);

        const res = await request(server)
          .post('/api/invitation.accept')
          .set('Authorization', `Bearer ${runnerSession.accessToken}`)
          .send({
            token,
          });

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
          ok: true,
          user: {
            id: expect.any(String),
            updatedAt: expect.any(String),
          },
        });

        expect(f).toHaveBeenCalledWith({
          user: expect.objectContaining({
            id: expect.any(String),
            username: expect.any(String),
            fullName: expect.any(String),
            emails: expect.any(Array),
          }),
          org: expect.objectContaining({
            id: expect.any(String),
          }),
        });
      });

      test('pretends token does not exist when requestor does not match the invitee', async () => {
        const res = await request(server)
          .post('/api/invitation.accept')
          .set('Authorization', `Bearer ${porkySession.accessToken}`)
          .send({
            token,
          });

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
          ok: false,
          error: {
            code: 10027,
          },
        });
      });
    });
  });
});
