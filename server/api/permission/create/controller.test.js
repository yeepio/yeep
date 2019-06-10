/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import config from '../../../../yeep.config';
import createPermission from './service';
import deletePermission from '../delete/service';
import createUser from '../../user/create/service';
// import createOrg from '../../org/create/service';
import deleteUser from '../../user/delete/service';
// import deleteOrg from '../../org/delete/service';
import { issueSessionToken } from '../../session/issueToken/service';
import { destroySessionToken } from '../../session/destroyToken/service';
import createPermissionAssignment from '../../user/assignPermission/service';
import deletePermissionAssignment from '../../user/revokePermission/service';

describe('api/permission.create', () => {
  let ctx;
  let user;
  let permissionAssignment;
  let session;

  beforeAll(async () => {
    await server.setup(config);
    ctx = server.getAppContext();

    // ctx.org = await createOrg(ctx, {
    //   name: 'Acme Inc',
    //   slug: 'acme',
    // });

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

    const PermissionModel = ctx.db.model('Permission');
    const permission = await PermissionModel.findOne({ name: 'yeep.permission.write' });
    permissionAssignment = await createPermissionAssignment(ctx, {
      userId: user.id,
      // orgId: ctx.org.id,
      permissionId: permission.id,
    });

    session = await issueSessionToken(ctx, {
      username: 'wile',
      password: 'catch-the-b1rd$',
    });
  });

  afterAll(async () => {
    await destroySessionToken(ctx, session);
    await deletePermissionAssignment(ctx, permissionAssignment);
    // await deleteOrg(ctx, ctx.org);
    await deleteUser(ctx, user);
    await server.teardown();
  });

  test('returns error when permission name is reserved', async () => {
    const res = await request(server)
      .post('/api/permission.create')
      .set('Authorization', `Bearer ${session.token}`)
      .send({
        name: 'yeep.permission.test',
        description: 'This is a tost',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10015,
        message: 'Permissions starting with "yeep" are reserved for system use',
      },
    });
  });

  test('returns error when permission already exists', async () => {
    const permission = await createPermission(ctx, {
      name: 'acme.test',
      description: 'This is a test',
    });

    const res = await request(server)
      .post('/api/permission.create')
      .set('Authorization', `Bearer ${session.token}`)
      .send({
        name: 'acme.test',
        description: 'This is a tost',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10007,
        message: 'Permission "acme.test" already exists',
      },
    });

    const isPermissionDeleted = await deletePermission(ctx, permission);
    expect(isPermissionDeleted).toBe(true);
  });

  test('returns error when permission + scope already exists', async () => {
    const permission = await createPermission(ctx, {
      name: 'acme.test',
      description: 'This is a test',
      scope: '5b2d646ce248cb779e7f26cc',
    });

    const res = await request(server)
      .post('/api/permission.create')
      .set('Authorization', `Bearer ${session.token}`)
      .send({
        name: 'acme.test',
        description: 'This is a tost',
        scope: '5b2d646ce248cb779e7f26cc',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10007,
        message: 'Permission "acme.test" already exists',
      },
    });

    const isPermissionDeleted = await deletePermission(ctx, permission);
    expect(isPermissionDeleted).toBe(true);
  });

  test('creates new permission and returns expected response', async () => {
    const res = await request(server)
      .post('/api/permission.create')
      .set('Authorization', `Bearer ${session.token}`)
      .send({
        name: 'acme.test',
        description: 'This is a test',
        scope: '5b2d649ce248cb779e7f26e2',
      });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      permission: expect.objectContaining({
        id: expect.any(String),
        name: 'acme.test',
        description: 'This is a test',
        scope: '5b2d649ce248cb779e7f26e2',
        isSystemPermission: false,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    });

    const isPermissionDeleted = await deletePermission(ctx, {
      id: res.body.permission.id,
    });
    expect(isPermissionDeleted).toBe(true);
  });
});
