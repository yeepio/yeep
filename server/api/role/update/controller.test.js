/* eslint-env jest */
import request from 'supertest';
import compareDesc from 'date-fns/compare_desc';
import server from '../../../server';
import config from '../../../../yeep.config';
import createPermission from '../../permission/create/service';
import createOrg from '../../org/create/service';
import createUser from '../../user/create/service';
import createPermissionAssignment from '../../user/assignPermission/service';
import createSessionToken from '../../session/create/service';
import destroySessionToken from '../../session/destroy/service';
import deletePermissionAssignment from '../../user/revokePermission/service';
import deleteOrg from '../../org/delete/service';
import deleteUser from '../../user/delete/service';
import deletePermission from '../../permission/delete/service';
import createRole from '../create/service';
import deleteRole from '../delete/service';

describe('api/v1/role.update', () => {
  let ctx;
  let user;
  let org;
  let permission;
  let permissionAssignment;
  let session;

  beforeAll(async () => {
    await server.setup(config);
    ctx = server.getAppContext();

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

    permission = await createPermission(ctx.db, {
      name: 'acme.test',
      description: 'you know, for testing',
      scope: org.id,
    });

    const PermissionModel = ctx.db.model('Permission');
    const requiredPermission = await PermissionModel.findOne({ name: 'yeep.role.write' });
    permissionAssignment = await createPermissionAssignment(ctx.db, {
      userId: user.id,
      orgId: org.id,
      permissionId: requiredPermission.id,
    });

    session = await createSessionToken(ctx, {
      username: 'wile',
      password: 'catch-the-b1rd$',
    });
  });

  afterAll(async () => {
    await destroySessionToken(ctx.db, session);
    await deletePermissionAssignment(ctx.db, permissionAssignment);
    await deletePermission(ctx.db, permission);
    await deleteOrg(ctx.db, org);
    await deleteUser(ctx.db, user);
    await server.teardown();
  });

  test('returns error when role does not exist', async () => {
    const res = await request(server)
      .post('/api/v1/role.update')
      .set('Authorization', `Bearer ${session.token}`)
      .send({
        id: '5b2d5dd0cd86b77258e16d39', // some random objectid
        name: 'acme:developer',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10017,
        message: 'Role 5b2d5dd0cd86b77258e16d39 cannot be found',
      },
    });
  });

  test('returns error when role is system-defined', async () => {
    // explicitely assign permission to global scope
    const globalPermission = await ctx.db.model('Permission').findOne({ name: 'yeep.role.write' });
    const globalPermissionAssignment = await createPermissionAssignment(ctx.db, {
      userId: user.id,
      permissionId: globalPermission.id,
    });

    // acquire global role
    const role = await ctx.db.model('Role').findOne({ name: 'admin' });

    const res = await request(server)
      .post('/api/v1/role.update')
      .set('Authorization', `Bearer ${session.token}`)
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

    await deletePermissionAssignment(ctx.db, globalPermissionAssignment);
  });

  test('returns error when specified permission does not exist', async () => {
    const role = await createRole(ctx.db, {
      name: 'acme:manager',
      description: 'This is a test',
      permissions: [permission.id],
      scope: org.id,
    });

    const res = await request(server)
      .post('/api/v1/role.update')
      .set('Authorization', `Bearer ${session.token}`)
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

    const isRoleDeleted = await deleteRole(ctx.db, {
      id: role.id,
    });
    expect(isRoleDeleted).toBe(true);
  });

  test('updates role and returns expected response', async () => {
    const role = await createRole(ctx.db, {
      name: 'acme:manager',
      description: 'This is a test',
      permissions: [permission.id],
      scope: org.id,
    });

    const res = await request(server)
      .post('/api/v1/role.update')
      .set('Authorization', `Bearer ${session.token}`)
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

    const isRoleDeleted = await deleteRole(ctx.db, {
      id: role.id,
    });
    expect(isRoleDeleted).toBe(true);
  });

  test('returns error when role is out of scope', async () => {
    const globalPermission = await ctx.db.model('Permission').findOne({ name: 'yeep.role.write' });
    const role = await createRole(ctx.db, {
      // note the absence of scope to denote global permission
      name: 'developer',
      description: 'This is a test',
      permissions: [globalPermission.id],
    });

    const res = await request(server)
      .post('/api/v1/role.update')
      .set('Authorization', `Bearer ${session.token}`)
      .send({
        id: role.id,
        name: 'dev',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10012,
        message: 'User "wile" does not have sufficient permissions to access this resource',
      },
    });

    const isRoleDeleted = await deleteRole(ctx.db, {
      id: role.id,
    });
    expect(isRoleDeleted).toBe(true);
  });
});
