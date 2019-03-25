/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import config from '../../../../yeep.config';
import createPermission from '../../permission/create/service';
import deletePermission from '../../permission/delete/service';
import createUser from '../../user/create/service';
import createOrg from '../../org/create/service';
import deleteUser from '../../user/delete/service';
import deleteOrg from '../../org/delete/service';
import createSession from '../../session/create/service';
import destroySession from '../../session/destroy/service';
import createPermissionAssignment from '../../user/assignPermission/service';
import deletePermissionAssignment from '../../user/revokePermission/service';
import deleteRole from '../delete/service';

describe('api/role.create', () => {
  let ctx;
  let user;
  let org;
  let permission;
  let permissionAssignment;
  let session;

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
      permissionId: requiredPermission.id,
    });

    session = await createSession(ctx, {
      username: 'wile',
      password: 'catch-the-b1rd$',
    });
  });

  afterAll(async () => {
    await destroySession(ctx, session);
    await deletePermissionAssignment(ctx, permissionAssignment);
    await deletePermission(ctx, permission);
    await deleteOrg(ctx, org);
    await deleteUser(ctx, user);
    await server.teardown();
  });

  test('returns error when role already exists', async () => {
    const res = await request(server)
      .post('/api/role.create')
      .set('Authorization', `Bearer ${session.accessToken}`)
      .send({
        name: 'admin',
        description: 'This is a test',
        permissions: [permission.id],
        scope: org.id,
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10016,
        message: 'Role "admin" already exists',
      },
    });
  });

  test('creates new role and returns expected response', async () => {
    const res = await request(server)
      .post('/api/role.create')
      .set('Authorization', `Bearer ${session.accessToken}`)
      .send({
        name: 'acme:manager',
        description: 'This is a test',
        permissions: [permission.id],
        scope: org.id,
      });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      role: expect.objectContaining({
        id: expect.any(String),
        name: 'acme:manager',
        description: 'This is a test',
        scope: org.id,
        permissions: [permission.id],
        isSystemRole: false,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    });

    const isRoleDeleted = await deleteRole(ctx, {
      id: res.body.role.id,
    });
    expect(isRoleDeleted).toBe(true);
  });
});
