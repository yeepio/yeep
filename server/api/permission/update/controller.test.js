/* eslint-env jest */
import request from 'supertest';
import compareDesc from 'date-fns/compare_desc';
import server from '../../../server';
import config from '../../../../yeep.config';
import createPermission from '../create/service';
import createOrg from '../../org/create/service';
import createUser from '../../user/create/service';
import createPermissionAssignment from '../../user/assignPermission/service';
import createSessionToken from '../../session/create/service';
import destroySessionToken from '../../session/destroy/service';
import deletePermissionAssignment from '../../user/revokePermission/service';
import deleteOrg from '../../org/delete/service';
import deleteUser from '../../user/delete/service';
import deletePermission from '../delete/service';

describe('api/v1/permission.update', () => {
  let ctx;
  let user;
  let org;
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

    const PermissionModel = ctx.db.model('Permission');
    const permission = await PermissionModel.findOne({ name: 'yeep.permission.write' });
    permissionAssignment = await createPermissionAssignment(ctx.db, {
      userId: user.id,
      orgId: org.id,
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
    await server.teardown();
  });

  test('returns error when permission does not exist', async () => {
    const res = await request(server)
      .post('/api/v1/permission.update')
      .set('Authorization', `Bearer ${session.token}`)
      .send({
        id: '5b2d5dd0cd86b77258e16d39', // some random objectid
        name: 'acme.tost',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10008,
        message: 'Permission 5b2d5dd0cd86b77258e16d39 cannot be found',
      },
    });
  });

  test('returns error when permission is system-defined', async () => {
    const PermissionModel = ctx.db.model('Permission');
    const permission = await PermissionModel.findOne({ name: 'yeep.permission.write' });
    const permissionAssignment = await createPermissionAssignment(ctx.db, {
      userId: user.id,
      permissionId: permission.id,
    });

    const res = await request(server)
      .post('/api/v1/permission.update')
      .set('Authorization', `Bearer ${session.token}`)
      .send({
        id: permission.id,
        name: 'acme.tost',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10009,
        message: `Permission ${permission.id} is a system permission and thus cannot be updated`,
      },
    });

    await deletePermissionAssignment(ctx.db, permissionAssignment);
  });

  test('updates permission and returns expected response', async () => {
    const permission = await createPermission(ctx.db, {
      name: 'acme.test',
      description: 'This is a test',
      scope: org.id,
    });

    const res = await request(server)
      .post('/api/v1/permission.update')
      .set('Authorization', `Bearer ${session.token}`)
      .send({
        id: permission.id,
        name: 'acme.tost',
        description: 'This is a tost',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      permission: {
        id: permission.id,
        name: 'acme.tost',
        description: 'This is a tost',
        scope: permission.scope,
        isSystemPermission: permission.isSystemPermission,
      },
    });
    expect(compareDesc(permission.createdAt, res.body.permission.createdAt)).toBe(0);
    expect(compareDesc(permission.updatedAt, res.body.permission.updatedAt)).toBe(1);

    const isPermissionDeleted = await deletePermission(ctx.db, {
      id: res.body.permission.id,
    });
    expect(isPermissionDeleted).toBe(true);
  });

  test('returns error when permission is out of scope', async () => {
    const permission = await createPermission(ctx.db, {
      // note the absence of scope to denote global permission
      name: 'acme.test',
      description: 'This is a test',
    });

    const res = await request(server)
      .post('/api/v1/permission.update')
      .set('Authorization', `Bearer ${session.token}`)
      .send({
        id: permission.id,
        name: 'acme.tost',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10012,
        message: 'User "wile" does not have sufficient permissions to access this resource',
      },
    });

    const isPermissionDeleted = await deletePermission(ctx.db, permission);
    expect(isPermissionDeleted).toBe(true);
  });
});
