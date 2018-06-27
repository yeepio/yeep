/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import createPermission from '../create/service';
import createOrg from '../../org/create/service';
import createUser from '../../user/create/service';
import createPermissionAssignment from '../../user/assignPermission/service';
import createSessionToken from '../../session/create/service';
import destroySessionToken from '../../session/destroy/service';
import deletePermissionAssignment from '../../user/revokePermission/service';
import deleteOrg from '../../org/delete/service';
import deleteUser from '../../user/delete/service';
import deletePermission from './service';

describe('api/v1/permission.delete', () => {
  let ctx;

  beforeAll(async () => {
    await server.setup();
    ctx = server.getAppContext();

    ctx.org = await createOrg(ctx.db, {
      name: 'Acme Inc',
      slug: 'acme',
    });

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

    ctx.session = await createSessionToken(ctx.db, ctx.jwt, {
      username: 'wile',
      password: 'catch-the-b1rd$',
    });
  });

  afterAll(async () => {
    await destroySessionToken(ctx.db, ctx.session);
    await deletePermissionAssignment(ctx.db, ctx.permissionAssignment);
    await deleteOrg(ctx.db, ctx.org);
    await deleteUser(ctx.db, ctx.user);
    await server.teardown();
  });

  test('returns error when permission does not exist', async () => {
    const res = await request(server)
      .post('/api/v1/permission.delete')
      .set('Authorization', `Bearer ${ctx.session.token}`)
      .send({
        id: '5b2d5dd0cd86b77258e16d39', // some random objectid
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
    const permission = await PermissionModel.findOne({
      name: 'yeep.permission.write',
      scope: { $exists: false },
    });
    const permissionAssignment = await createPermissionAssignment(ctx.db, {
      userId: ctx.user.id,
      permissionId: permission.id,
    });

    const res = await request(server)
      .post('/api/v1/permission.delete')
      .set('Authorization', `Bearer ${ctx.session.token}`)
      .send({
        id: permission.id,
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10009,
        message: `Permission ${permission.id} is a system permission and thus cannot be deleted`,
      },
    });

    await deletePermissionAssignment(ctx.db, permissionAssignment);
  });

  test('deletes permission and returns expected response', async () => {
    const permission = await createPermission(ctx.db, {
      name: 'yeep.permission.test',
      description: 'This is a test',
      scope: ctx.org.id,
    });

    const res = await request(server)
      .post('/api/v1/permission.delete')
      .set('Authorization', `Bearer ${ctx.session.token}`)
      .send({
        id: permission.id,
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
    });
  });

  test('returns error when permission is out of scope', async () => {
    const permission = await createPermission(ctx.db, {
      // note the absence of scope to denote global permission
      name: 'yeep.permission.test',
      description: 'This is a test',
    });

    const res = await request(server)
      .post('/api/v1/permission.delete')
      .set('Authorization', `Bearer ${ctx.session.token}`)
      .send({
        id: permission.id, // some random objectid
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10012,
        message:
          'User "wile" does not have permission "yeep.permission.write" to access this resource',
      },
    });

    const isPermissionDeleted = await deletePermission(ctx.db, permission);
    expect(isPermissionDeleted).toBe(true);
  });
});
