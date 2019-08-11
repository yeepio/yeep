/* eslint-env jest */
import request from 'supertest';
import compareDesc from 'date-fns/compare_desc';
import server from '../../../server';
import config from '../../../../yeep.config';
import createPermission from '../../permission/create/service';
import createOrg from '../../org/create/service';
import createUser from '../../user/create/service';
import createPermissionAssignment from '../../user/assignPermission/service';
import { createSession, signBearerJWT } from '../../session/issueToken/service';
import { destroySession } from '../../session/destroyToken/service';
import deletePermissionAssignment from '../../user/revokePermission/service';
import deleteOrg from '../../org/delete/service';
import deleteUser from '../../user/delete/service';
import deletePermission from '../../permission/delete/service';
import createRole from '../create/service';
import deleteRole from '../delete/service';

describe('api/role.update', () => {
  let ctx;
  let user;
  let org;
  let permission;
  let permissionAssignment;
  let session;
  let bearerToken;

  beforeAll(async () => {
    await server.setup(config);
    ctx = server.getAppContext();

    user = await createUser(ctx, {
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

    org = await createOrg(ctx, {
      name: 'Acme Inc',
      slug: 'acme',
      adminId: user.id,
    });

    permission = await createPermission(ctx, {
      name: 'acme.test',
      description: 'you know, for testing',
      scope: org.id,
    });

    const PermissionModel = ctx.db.model('Permission');
    const requiredPermission = await PermissionModel.findOne({ name: 'yeep.role.write' });
    permissionAssignment = await createPermissionAssignment(ctx, {
      userId: user.id,
      orgId: org.id,
      permissionId: requiredPermission.id,
    });

    session = await createSession(ctx, {
      username: 'wile',
      password: 'catch-the-b1rd$',
    });
    bearerToken = await signBearerJWT(ctx, session);
  });

  afterAll(async () => {
    await destroySession(ctx, session);
    await deletePermissionAssignment(ctx, permissionAssignment);
    await deletePermission(ctx, permission);
    await deleteOrg(ctx, org);
    await deleteUser(ctx, user);
    await server.teardown();
  });

  test('returns error when role does not exist', async () => {
    const res = await request(server)
      .post('/api/role.update')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        id: '5b2d5dd0cd86b77258e16d39', // some random objectid
        name: 'acme:developer',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10017,
        message: 'Role 5b2d5dd0cd86b77258e16d39 not found',
      },
    });
  });

  describe('role is system-defined', () => {
    let globalPermissionAssignment;

    beforeAll(async () => {
      // explicitely assign permission to global scope
      const globalPermission = await ctx.db
        .model('Permission')
        .findOne({ name: 'yeep.role.write' });
      globalPermissionAssignment = await createPermissionAssignment(ctx, {
        userId: user.id,
        permissionId: globalPermission.id,
      });
    });

    afterAll(async () => {
      await deletePermissionAssignment(ctx, globalPermissionAssignment);
    });

    test('returns error', async () => {
      // acquire global role
      const role = await ctx.db.model('Role').findOne({ name: 'admin' });

      const res = await request(server)
        .post('/api/role.update')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send({
          id: role.id,
          name: 'foo',
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10018,
          message: `Role ${role.id} is a system role and thus cannot be updated`,
        },
      });
    });
  });

  describe('permission does not exist', () => {
    let role;

    beforeAll(async () => {
      role = await createRole(ctx, {
        name: 'acme:manager',
        description: 'You know, for testing...',
        permissions: [permission.id],
        scope: org.id,
      });
    });

    afterAll(async () => {
      await deleteRole(ctx, {
        id: role.id,
      });
    });

    test('returns error', async () => {
      const res = await request(server)
        .post('/api/role.update')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send({
          id: role.id,
          name: 'acme:developer',
          permissions: [
            '5b2d5dd0cd86b77258e16d39', // some random objectid
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10008,
          message: 'Permission 5b2d5dd0cd86b77258e16d39 does not exist or is not accessible',
        },
      });
    });
  });

  describe('successful request', () => {
    let role;

    beforeAll(async () => {
      role = await createRole(ctx, {
        name: 'acme:manager',
        description: 'You know, for testing...',
        permissions: [permission.id],
        scope: org.id,
      });
    });

    afterAll(async () => {
      await deleteRole(ctx, {
        id: role.id,
      });
    });

    test('updates role and returns expected response', async () => {
      const res = await request(server)
        .post('/api/role.update')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send({
          id: role.id,
          name: 'acme:developer',
          description: 'This is a tost',
          permissions: [permission.id],
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
        role: {
          id: role.id,
          name: 'acme:developer',
          description: 'This is a tost',
          scope: role.scope,
          permissions: [permission.id],
          isSystemRole: role.isSystemRole,
        },
      });
      expect(compareDesc(role.createdAt, res.body.role.createdAt)).toBe(0);
      expect(compareDesc(role.updatedAt, res.body.role.updatedAt)).toBe(1);
    });
  });

  describe('role out of scope', () => {
    let role;

    beforeAll(async () => {
      const globalPermission = await ctx.db
        .model('Permission')
        .findOne({ name: 'yeep.role.write' });
      role = await createRole(ctx, {
        // note the absence of scope to denote global permission
        name: 'developer',
        description: 'You know, for testing...',
        permissions: [globalPermission.id],
      });
    });

    afterAll(async () => {
      await deleteRole(ctx, {
        id: role.id,
      });
    });

    test('returns error', async () => {
      const res = await request(server)
        .post('/api/role.update')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send({
          id: role.id,
          name: 'dev',
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10012,
          message: `User ${user.id} does not have sufficient permissions to access this resource`,
        },
      });
    });
  });
});
