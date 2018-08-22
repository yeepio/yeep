/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import createUser from '../../user/create/service';
import createPermissionAssignment from '../../user/assignPermission/service';
import createOrg from '../../org/create/service';
import createSessionToken from '../../session/create/service';
import destroySessionToken from '../../session/destroy/service';
import deletePermissionAssignment from '../../user/revokePermission/service';
import deleteOrg from '../../org/delete/service';
import deleteUser from '../../user/delete/service';

describe('api/v1/permission.list', () => {
  let ctx;
  let user;
  let orgs;
  let permissionAssignments;
  let session;

  beforeAll(async () => {
    await server.setup();
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

    orgs = await Promise.all([
      createOrg(ctx.db, {
        name: 'Acme Inc',
        slug: 'acme',
        adminId: user.id,
      }),
      createOrg(ctx.db, {
        name: 'Evil Empire Ltd',
        slug: 'gogle',
        adminId: user.id,
      }),
    ]);

    const PermissionModel = ctx.db.model('Permission');
    const permission = await PermissionModel.findOne({ name: 'yeep.permission.read' });
    permissionAssignments = await Promise.all([
      createPermissionAssignment(ctx.db, {
        userId: user.id,
        orgId: orgs[0].id,
        permissionId: permission.id,
        resourceId: '//foo',
      }),
      createPermissionAssignment(ctx.db, {
        userId: user.id,
        orgId: orgs[0].id,
        permissionId: permission.id,
      }),
      createPermissionAssignment(ctx.db, {
        userId: user.id,
        orgId: orgs[1].id,
        permissionId: permission.id,
      }),
      createPermissionAssignment(ctx.db, {
        userId: user.id,
        permissionId: permission.id,
        // absense of "org" prop implies global permission assignment
      }),
    ]);

    session = await createSessionToken(ctx.db, ctx.jwt, {
      username: 'wile',
      password: 'catch-the-b1rd$',
    });
  });

  afterAll(async () => {
    await destroySessionToken(ctx.db, session);
    await Promise.all(
      permissionAssignments.map((permissionAssignment) =>
        deletePermissionAssignment(ctx.db, permissionAssignment)
      )
    );
    await Promise.all(orgs.map((org) => deleteOrg(ctx.db, org)));
    await deleteUser(ctx.db, user);
    await server.teardown();
  });

  test('returns list of permissions the user has access to', async () => {
    const res = await request(server)
      .post('/api/v1/permission.list')
      .set('Authorization', `Bearer ${session.token}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      permissions: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          description: expect.any(String),
          isSystemPermission: expect.any(Boolean),
          usersCount: expect.any(Number),
          rolesCount: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      ]),
    });
  });

  test('limits number of permissions using `limit` param', async () => {
    const res = await request(server)
      .post('/api/v1/permission.list')
      .set('Authorization', `Bearer ${session.token}`)
      .send({
        limit: 1,
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      permissions: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          description: expect.any(String),
          isSystemPermission: expect.any(Boolean),
          usersCount: expect.any(Number),
          rolesCount: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      ]),
      nextCursor: expect.any(String),
    });
    expect(res.body.permissions.length).toBe(1);
  });

  test('paginates through permissions using `cursor` param', async () => {
    const res = await request(server)
      .post('/api/v1/permission.list')
      .set('Authorization', `Bearer ${session.token}`)
      .send({
        limit: 2,
      });
    expect(res.body).toMatchObject({
      ok: true,
    });
    expect(res.body.permissions.length).toBe(2);

    const res1 = await request(server)
      .post('/api/v1/permission.list')
      .set('Authorization', `Bearer ${session.token}`)
      .send({
        limit: 1,
      });
    expect(res1.body).toMatchObject({
      ok: true,
      nextCursor: expect.any(String),
    });
    expect(res1.body.permissions.length).toBe(1);
    expect(res1.body.permissions[0]).toEqual(res.body.permissions[0]);

    const res2 = await request(server)
      .post('/api/v1/permission.list')
      .set('Authorization', `Bearer ${session.token}`)
      .send({
        limit: 1,
        cursor: res1.body.nextCursor,
      });
    expect(res2.body).toMatchObject({
      ok: true,
    });
    expect(res2.body.permissions.length).toBe(1);
    expect(res2.body.permissions[0]).toEqual(res.body.permissions[1]);
  });

  test('filters permissions using `q` param', async () => {
    const res = await request(server)
      .post('/api/v1/permission.list')
      .set('Authorization', `Bearer ${session.token}`)
      .send({
        q: 'yeep.perm',
      });
    expect(res.body).toMatchObject({
      ok: true,
      permissions: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.stringMatching(/^yeep\.perm/),
          description: expect.any(String),
          isSystemPermission: expect.any(Boolean),
          usersCount: expect.any(Number),
          rolesCount: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      ]),
    });
  });
});
