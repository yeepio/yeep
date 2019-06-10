/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import config from '../../../../yeep.config';
import createUser from '../../user/create/service';
import createOrg from '../../org/create/service';
import createRole from '../../role/create/service';
import { issueSessionToken } from '../../session/issueToken/service';
import { destroySessionToken } from '../../session/destroyToken/service';
import deleteOrg from '../../org/delete/service';
import deleteRole from '../../role/delete/service';
import deleteUser from '../../user/delete/service';
import createPermission from '../create/service';
import deletePermission from '../delete/service';

describe('api/permission.list', () => {
  let ctx;
  let wile;
  let acme;
  let monsters;
  let role;
  let unauthorisedRole;
  let permissions;
  let session;

  beforeAll(async () => {
    await server.setup(config);
    ctx = server.getAppContext();

    wile = await createUser(ctx, {
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
    [acme, monsters] = await Promise.all([
      createOrg(ctx, {
        name: 'Acme Inc',
        slug: 'acme',
        adminId: wile.id,
      }),
      createOrg(ctx, {
        name: 'Monsters Inc',
        slug: 'monsters',
        adminId: wile.id,
      }),
    ]);

    // create test permission
    permissions = await Promise.all([
      createPermission(ctx, {
        name: 'acme.code.write',
        description: 'Permission to edit (write, delete, update) source code',
        scope: acme.id,
      }),
      createPermission(ctx, {
        name: 'monsters.code.write',
        description: 'Permission to edit (write, delete, update) source code',
        scope: monsters.id,
      }),
      createPermission(ctx, {
        name: 'global.code.write',
        description: 'Permission to edit (write, delete, update) source code',
      }),
    ]);

    [role, unauthorisedRole] = await Promise.all([
      createRole(ctx, {
        name: 'monsters:developer',
        description: 'Developer role',
        permissions: [permissions[1].id],
        scope: monsters.id,
      }),
      createRole(ctx, {
        name: 'global:developer',
        description: 'Developer role',
        permissions: [permissions[2].id],
      }),
    ]);

    session = await issueSessionToken(ctx, {
      username: 'wile',
      password: 'catch-the-b1rd$',
    });
  });

  afterAll(async () => {
    await destroySessionToken(ctx, session);
    await Promise.all(permissions.map((permission) => deletePermission(ctx, permission)));
    await deleteOrg(ctx, acme);
    await deleteOrg(ctx, monsters);
    await deleteUser(ctx, wile);
    await deleteRole(ctx, role);
    await deleteRole(ctx, unauthorisedRole);
    await server.teardown();
  });

  test('returns list of permissions the user has access to', async () => {
    const res = await request(server)
      .post('/api/permission.list')
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
    expect(res.body.permissions.length).toBe(2);
  });

  test('limits number of permissions using `limit` param', async () => {
    const res = await request(server)
      .post('/api/permission.list')
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
      .post('/api/permission.list')
      .set('Authorization', `Bearer ${session.token}`)
      .send({
        limit: 2,
      });
    expect(res.body).toMatchObject({
      ok: true,
    });
    expect(res.body.permissions.length).toBe(2);

    const res1 = await request(server)
      .post('/api/permission.list')
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
      .post('/api/permission.list')
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
      .post('/api/permission.list')
      .set('Authorization', `Bearer ${session.token}`)
      .send({
        q: 'acme',
      });
    expect(res.body).toMatchObject({
      ok: true,
      permissions: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.stringMatching(/^acme\./),
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

  test('filters permissions using `scope` param', async () => {
    const res = await request(server)
      .post('/api/permission.list')
      .set('Authorization', `Bearer ${session.token}`)
      .send({
        scope: acme.id,
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      permissions: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.stringMatching(/^acme\./),
          description: expect.any(String),
          isSystemPermission: expect.any(Boolean),
          usersCount: expect.any(Number),
          rolesCount: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      ]),
    });
    expect(res.body.permissions.length).toBe(1);
  });

  test('filters permissions using `role` param', async () => {
    const res = await request(server)
      .post('/api/permission.list')
      .set('Authorization', `Bearer ${session.token}`)
      .send({
        role: role.id,
      });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      permissions: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.stringMatching(/^monsters\./),
          description: expect.any(String),
          isSystemPermission: expect.any(Boolean),
          usersCount: expect.any(Number),
          rolesCount: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      ]),
    });
    expect(res.body.permissions.length).toBe(1);
  });

  test('throws error when trying to filter by `role` param when unauthorised', async () => {
    const res = await request(server)
      .post('/api/permission.list')
      .set('Authorization', `Bearer ${session.token}`)
      .send({
        role: unauthorisedRole.id,
      });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: expect.objectContaining({
        code: 10012,
        message: expect.any(String),
      }),
    });
  });

  test('filters permissions using `isSystemPermission` param', async () => {
    const res = await request(server)
      .post('/api/permission.list')
      .set('Authorization', `Bearer ${session.token}`)
      .send({
        isSystemPermission: true,
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      permissions: expect.arrayContaining([]),
    });
    expect(res.body.permissions.length).toBe(0);
  });
});
