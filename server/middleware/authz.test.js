/* eslint-env jest */
import server from '../server';
import createUser from '../api/user/create/service';
import deleteUser from '../api/user/delete/service';
import createSessionToken from '../api/session/create/service';
import destroySessionToken from '../api/session/destroy/service';
import createPermissionAssignment from '../api/user/assignPermission/service';
import deletePermissionAssignment from '../api/user/revokePermission/service';
import createAuthzMiddleware from './authz';
import deleteOrg from '../api/org/delete/service';
import createOrg from '../api/org/create/service';

describe('authz middleware', () => {
  let ctx;

  beforeAll(async () => {
    await server.setup();
    ctx = server.getAppContext();

    ctx.user = await createUser(ctx.db, {
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

    ctx.session = await createSessionToken(ctx.db, ctx.jwt, {
      username: 'wile',
      password: 'catch-the-b1rd$',
    });
  });

  afterAll(async () => {
    await destroySessionToken(ctx.db, ctx.session);
    await deleteUser(ctx.db, ctx.user);
    await server.teardown();
  });

  describe('factory function', () => {
    test('throws TypeError when permissions are undefined', async () => {
      expect(() => createAuthzMiddleware({})).toThrowError(TypeError);
    });

    test('throws TypeError when permissions are empty array', async () => {
      expect(() => createAuthzMiddleware({ permissions: [] })).toThrowError(TypeError);
    });
  });

  describe('non-authenticated user', () => {
    test('throws authorization error', async () => {
      const authz = createAuthzMiddleware({
        permissions: ['yeep.permission.write'],
        org: (request) => request.body.org,
      });

      const next = jest.fn(() => Promise.resolve());
      const request = {
        session: {
          user: ctx.user,
        },
        body: {},
      };

      await expect(authz({ request, db: ctx.db }, next)).rejects.toMatchObject({
        code: 10012,
        message:
          'User "wile" does not have permission "yeep.permission.write" to access this resource',
      });
    });
  });

  describe('user does not have required permission(s)', () => {
    test('throws authorization error', async () => {
      const authz = createAuthzMiddleware({
        permissions: ['yeep.permission.write'],
        org: (request) => request.body.org,
      });

      const next = jest.fn(() => Promise.resolve());
      const request = {
        session: {},
        body: {},
      };

      await expect(authz({ request, db: ctx.db }, next)).rejects.toMatchObject({
        code: 10012,
        message: 'Unable to authorize non-authenticated user',
      });
    });
  });

  describe('user has other permission(s), i.e. not the permission(s) required', () => {
    beforeAll(async () => {
      const PermissionModel = ctx.db.model('Permission');
      const permission = await PermissionModel.findOne({
        name: 'yeep.permission.read',
        scope: { $exists: false },
      });
      ctx.permissionAssignment = await createPermissionAssignment(ctx.db, {
        userId: ctx.user.id,
        permissionId: permission.id,
      });
    });

    afterAll(async () => {
      await deletePermissionAssignment(ctx.db, ctx.permissionAssignment);
    });

    test('throws authorization error', async () => {
      const authz = createAuthzMiddleware({
        permissions: ['yeep.permission.read', 'yeep.permission.write'],
        org: (request) => request.body.org,
      });

      const next = jest.fn(() => Promise.resolve());
      const request = {
        session: {
          user: ctx.user,
        },
        body: {},
      };

      await expect(authz({ request, db: ctx.db }, next)).rejects.toMatchObject({
        code: 10012,
        message:
          'User "wile" does not have permission "yeep.permission.write" to access this resource',
      });
    });
  });

  describe('user has permission(s) to other org, i.e. not the org required', () => {
    beforeAll(async () => {
      ctx.org = await createOrg(ctx.db, {
        name: 'Acme Inc',
        slug: 'acme',
      });

      ctx.otherOrg = await createOrg(ctx.db, {
        name: 'Speak Riddles Old Man Ltd',
        slug: 'speakriddles',
      });

      const PermissionModel = ctx.db.model('Permission');
      const permission = await PermissionModel.findOne({
        name: 'yeep.permission.write',
        scope: { $exists: false },
      });
      ctx.permissionAssignment = await createPermissionAssignment(ctx.db, {
        userId: ctx.user.id,
        orgId: ctx.otherOrg.id,
        permissionId: permission.id,
      });
    });

    afterAll(async () => {
      await deletePermissionAssignment(ctx.db, ctx.permissionAssignment);
      await deleteOrg(ctx.db, ctx.org);
      await deleteOrg(ctx.db, ctx.otherOrg);
    });

    test('throws authorization error', async () => {
      const authz = createAuthzMiddleware({
        permissions: ['yeep.permission.write'],
        org: (request) => request.body.org,
      });

      const next = jest.fn(() => Promise.resolve());
      const request = {
        session: {
          user: ctx.user,
        },
        body: {
          org: ctx.org.id,
        },
      };

      await expect(authz({ request, db: ctx.db }, next)).rejects.toMatchObject({
        code: 10012,
        message:
          'User "wile" does not have permission "yeep.permission.write" to access this resource',
      });
    });
  });

  describe('user has valid scoped permission(s)', () => {
    beforeAll(async () => {
      ctx.org = await createOrg(ctx.db, {
        name: 'Acme Inc',
        slug: 'acme',
      });

      const PermissionModel = ctx.db.model('Permission');
      const permission = await PermissionModel.findOne({
        name: 'yeep.permission.write',
        scope: { $exists: false },
      });
      ctx.permissionAssignment = await createPermissionAssignment(ctx.db, {
        userId: ctx.user.id,
        orgId: ctx.org.id,
        permissionId: permission.id,
      });
    });

    afterAll(async () => {
      await deletePermissionAssignment(ctx.db, ctx.permissionAssignment);
      await deleteOrg(ctx.db, ctx.org);
    });

    test('calls next as expected', async () => {
      const authz = createAuthzMiddleware({
        permissions: ['yeep.permission.write'],
        org: (request) => request.body.org,
      });

      const next = jest.fn(() => Promise.resolve());
      const request = {
        session: {
          user: ctx.user,
        },
        body: {
          org: ctx.org.id,
        },
      };

      await expect(authz({ request, db: ctx.db }, next)).resolves.toBe();
      expect(next.mock.calls.length).toBe(1);
    });
  });

  describe('user has valid global permission(s)', () => {
    beforeAll(async () => {
      ctx.org = await createOrg(ctx.db, {
        name: 'Acme Inc',
        slug: 'acme',
      });

      const PermissionModel = ctx.db.model('Permission');
      const permission = await PermissionModel.findOne({
        name: 'yeep.permission.write',
        scope: { $exists: false },
      });
      ctx.permissionAssignment = await createPermissionAssignment(ctx.db, {
        // note the absence of orgId to mark this as global permission assignment
        userId: ctx.user.id,
        permissionId: permission.id,
      });
    });

    afterAll(async () => {
      await deletePermissionAssignment(ctx.db, ctx.permissionAssignment);
      await deleteOrg(ctx.db, ctx.org);
    });

    test('calls next as expected', async () => {
      const authz = createAuthzMiddleware({
        permissions: ['yeep.permission.write'],
        org: (request) => request.body.org,
      });

      const next = jest.fn(() => Promise.resolve());
      const request = {
        session: {
          user: ctx.user,
        },
        body: {
          org: ctx.org.id,
        },
      };

      await expect(authz({ request, db: ctx.db }, next)).resolves.toBe();
      expect(next.mock.calls.length).toBe(1);
    });
  });
});
