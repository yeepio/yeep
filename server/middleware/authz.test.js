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
  });

  afterAll(async () => {
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

  describe('user does not have required permission(s)', () => {
    let org;
    let user;
    let session;

    beforeAll(async () => {
      user = await createUser(ctx.db, {
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
        adminId: user.id,
      });

      session = await createSessionToken(ctx.db, ctx.jwt, {
        username: 'wile',
        password: 'catch-the-b1rd$',
      });
    });

    afterAll(async () => {
      await destroySessionToken(ctx.db, session);
      await deleteUser(ctx.db, user);
      await deleteOrg(ctx.db, org);
    });

    test('throws authorization error', async () => {
      const authz = createAuthzMiddleware({
        permissions: ['yeep.permission.write'],
        org: (request) => request.body.org,
      });

      const next = jest.fn(() => Promise.resolve());
      const request = {
        session: {
          user,
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

  describe('user has other permission(s), i.e. not the permission(s) required', () => {
    let user;
    let permissionAssignment;
    let session;

    beforeAll(async () => {
      user = await createUser(ctx.db, {
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
        name: 'yeep.permission.read',
      });
      permissionAssignment = await createPermissionAssignment(ctx.db, {
        userId: user.id,
        permissionId: permission.id,
      });

      session = await createSessionToken(ctx.db, ctx.jwt, {
        username: 'wile',
        password: 'catch-the-b1rd$',
      });
    });

    afterAll(async () => {
      await destroySessionToken(ctx.db, session);
      await deletePermissionAssignment(ctx.db, permissionAssignment);
      await deleteUser(ctx.db, user);
    });

    test('throws authorization error', async () => {
      const authz = createAuthzMiddleware({
        permissions: ['yeep.permission.read', 'yeep.permission.write'],
        org: (request) => request.body.org,
      });

      const next = jest.fn(() => Promise.resolve());
      const request = {
        session: {
          user,
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
    let user;
    let org;
    let otherUser;
    let otherOrg;
    let session;

    beforeAll(async () => {
      user = await createUser(ctx.db, {
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
        adminId: user.id,
      });

      otherUser = await createUser(ctx.db, {
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

      otherOrg = await createOrg(ctx.db, {
        name: 'Speak Riddles Old Man Ltd',
        slug: 'speakriddles',
        adminId: otherUser.id,
      });

      session = await createSessionToken(ctx.db, ctx.jwt, {
        username: 'wile',
        password: 'catch-the-b1rd$',
      });
    });

    afterAll(async () => {
      await destroySessionToken(ctx.db, session);
      await deleteOrg(ctx.db, org);
      await deleteUser(ctx.db, user);
      await deleteOrg(ctx.db, otherOrg);
      await deleteUser(ctx.db, otherUser);
    });

    test('throws authorization error', async () => {
      const authz = createAuthzMiddleware({
        permissions: ['yeep.permission.write'],
        org: (request) => request.body.org.id,
      });

      const next = jest.fn(() => Promise.resolve());
      const request = {
        session: {
          user,
        },
        body: {
          org: otherOrg,
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
    let org;
    let user;
    let session;

    beforeAll(async () => {
      user = await createUser(ctx.db, {
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
        adminId: user.id,
      });

      session = await createSessionToken(ctx.db, ctx.jwt, {
        username: 'wile',
        password: 'catch-the-b1rd$',
      });
    });

    afterAll(async () => {
      await destroySessionToken(ctx.db, session);
      await deleteOrg(ctx.db, org);
      await deleteUser(ctx.db, user);
    });

    test('calls next as expected', async () => {
      const authz = createAuthzMiddleware({
        permissions: ['yeep.permission.write'],
        org: (request) => request.body.org.id,
      });

      const next = jest.fn(() => Promise.resolve());
      const request = {
        session: {
          user,
        },
        body: {
          org,
        },
      };

      await expect(authz({ request, db: ctx.db }, next)).resolves.toBe();
      expect(next.mock.calls.length).toBe(1);
    });

    test('throws authorization error when org is undefined in request', async () => {
      const authz = createAuthzMiddleware({
        permissions: ['yeep.permission.write'],
        org: (request) => request.body.org,
      });

      const next = jest.fn(() => Promise.resolve());
      const request = {
        session: {
          user,
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

  describe('user has valid global permission(s)', () => {
    let org;
    let user;
    let otherUser;
    let permissionAssignment;
    let session;

    beforeAll(async () => {
      user = await createUser(ctx.db, {
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
        adminId: user.id,
      });

      otherUser = await createUser(ctx.db, {
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

      const PermissionModel = ctx.db.model('Permission');
      const permission = await PermissionModel.findOne({
        name: 'yeep.permission.write',
      });
      permissionAssignment = await createPermissionAssignment(ctx.db, {
        // note the absence of orgId to mark this as global permission assignment
        userId: otherUser.id,
        permissionId: permission.id,
      });

      session = await createSessionToken(ctx.db, ctx.jwt, {
        username: 'wile',
        password: 'catch-the-b1rd$',
      });
    });

    afterAll(async () => {
      await destroySessionToken(ctx.db, session);
      await deletePermissionAssignment(ctx.db, permissionAssignment);
      await deleteOrg(ctx.db, org);
      await deleteUser(ctx.db, user);
      await deleteUser(ctx.db, otherUser);
    });

    test('calls next as expected', async () => {
      const authz = createAuthzMiddleware({
        permissions: ['yeep.permission.write'],
        org: (request) => request.body.org.id,
      });

      const next = jest.fn(() => Promise.resolve());
      const request = {
        session: {
          user: otherUser,
        },
        body: {
          org,
        },
      };

      await expect(authz({ request, db: ctx.db }, next)).resolves.toBe();
      expect(next.mock.calls.length).toBe(1);
    });
  });
});
