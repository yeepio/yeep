/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import config from '../../../../yeep.config';
import createPermission from '../create/service';
import createOrg from '../../org/create/service';
import createUser from '../../user/create/service';
import createPermissionAssignment from '../../user/assignPermission/service';
import { createSession, signBearerJWT } from '../../session/issueToken/service';
import { destroySession } from '../../session/destroyToken/service';
import deletePermissionAssignment from '../../user/revokePermission/service';
import deleteOrg from '../../org/delete/service';
import deleteUser from '../../user/delete/service';
import deletePermission from './service';

describe('api/permission.delete', () => {
  let ctx;
  let user;
  let org;
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

    const PermissionModel = ctx.db.model('Permission');
    const permission = await PermissionModel.findOne({ name: 'yeep.permission.write' });
    permissionAssignment = await createPermissionAssignment(ctx, {
      userId: user.id,
      orgId: org.id,
      permissionId: permission.id,
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
    await deleteOrg(ctx, org);
    await deleteUser(ctx, user);
    await server.teardown();
  });

  test('returns error when permission does not exist', async () => {
    const res = await request(server)
      .post('/api/permission.delete')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        id: '5b2d5dd0cd86b77258e16d39', // some random objectid
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10008,
        message: 'Permission 5b2d5dd0cd86b77258e16d39 not found',
      },
    });
  });

  test('returns error when permission is system-defined', async () => {
    const PermissionModel = ctx.db.model('Permission');
    const permission = await PermissionModel.findOne({ name: 'yeep.permission.write' });
    const permissionAssignment = await createPermissionAssignment(ctx, {
      userId: user.id,
      permissionId: permission.id,
    });

    const res = await request(server)
      .post('/api/permission.delete')
      .set('Authorization', `Bearer ${bearerToken}`)
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

    await deletePermissionAssignment(ctx, permissionAssignment);
  });

  test('deletes permission and returns expected response', async () => {
    const permission = await createPermission(ctx, {
      name: 'acme.test',
      description: 'This is a test',
      scope: org.id,
    });

    const res = await request(server)
      .post('/api/permission.delete')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        id: permission.id,
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
    });
  });

  test('returns error when permission is out of scope', async () => {
    const permission = await createPermission(ctx, {
      // note the absence of scope to denote global permission
      name: 'acme.test',
      description: 'This is a test',
    });

    const res = await request(server)
      .post('/api/permission.delete')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        id: permission.id,
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10012,
        message: `User ${user.id} does not have sufficient permissions to access this resource`,
      },
    });

    const isPermissionDeleted = await deletePermission(ctx, permission);
    expect(isPermissionDeleted).toBe(true);
  });
});
