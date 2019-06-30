/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import config from '../../../../yeep.config';
import createUser from '../../user/create/service';
import createOrg from '../../org/create/service';
import { createSession, signBearerJWT } from '../../session/issueToken/service';
import { destroySession } from '../../session/destroyToken/service';
import deleteOrg from '../../org/delete/service';
import deleteUser from '../../user/delete/service';
import createPermission from '../../permission/create/service';
import createRole from '../create/service';
import assignRole from '../../user/assignRole/service';
import deleteRole from '../delete/service';
import deletePermission from '../../permission/delete/service';

describe('api/role.list', () => {
  let ctx;
  let wile;
  let acme;
  let monsters;
  let umbrella;
  let permission;
  let roles;
  let globalRole;
  let session;
  let bearerToken;

  beforeAll(async () => {
    await server.setup(config);
    ctx = server.getAppContext();

    // user "wile" is admin in acme + monsters org
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
    [acme, monsters, umbrella] = await Promise.all([
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
      createOrg(ctx, {
        name: 'Umbrella Corp',
        slug: 'umbrella',
      }),
    ]);

    // create test permission + role(s)
    permission = await createPermission(ctx, {
      name: 'acme.code.write',
      description: 'Permission to edit (write, delete, update) source code',
    });

    roles = await Promise.all([
      createRole(ctx, {
        name: 'acme:developer',
        description: 'Developer role',
        permissions: [permission.id],
        scope: acme.id,
      }),
      createRole(ctx, {
        name: 'monsters:developer',
        description: 'Developer role',
        permissions: [permission.id],
        scope: monsters.id,
      }),
    ]);

    globalRole = await createRole(ctx, {
      name: 'global:role',
      description: 'Global test role',
      permissions: [permission.id],
    });

    await assignRole(ctx, {
      userId: wile.id,
      roleId: globalRole.id,
    });

    // user "wile" is logged-in
    session = await createSession(ctx, {
      username: 'wile',
      password: 'catch-the-b1rd$',
    });
    bearerToken = await signBearerJWT(ctx, session);
  });

  afterAll(async () => {
    await destroySession(ctx, session);
    await Promise.all(roles.map((role) => deleteRole(ctx, role)));
    await deleteRole(ctx, globalRole);
    await deletePermission(ctx, permission);
    await deleteUser(ctx, wile);
    await deleteOrg(ctx, acme);
    await deleteOrg(ctx, monsters);
    await deleteOrg(ctx, umbrella);
    await server.teardown();
  });

  test('returns list of roles the user has access to', async () => {
    const res = await request(server)
      .post('/api/role.list')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send();

    expect(res.status).toBe(200);
    // NOTE: global rules are not supposed to be sent back if a user
    //       has no permissions to read them.
    expect(res.body.roles.length).toBe(2);
    expect(res.body).toMatchObject({
      ok: true,
      roles: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          description: expect.any(String),
          isSystemRole: expect.any(Boolean),
          usersCount: expect.any(Number),
          permissions: expect.arrayContaining([expect.any(String)]),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          org: expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
          }),
        }),
      ]),
    });
    expect(res.body.roles.length).toBe(2);
  });

  test('limits number of roles using `limit` param', async () => {
    const res = await request(server)
      .post('/api/role.list')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        limit: 1,
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      roles: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          description: expect.any(String),
          isSystemRole: expect.any(Boolean),
          usersCount: expect.any(Number),
          permissions: expect.arrayContaining([expect.any(String)]),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          org: expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
          }),
        }),
      ]),
      nextCursor: expect.any(String),
    });
    expect(res.body.roles.length).toBe(1);
  });

  test('paginates through roles using `cursor` param', async () => {
    const res = await request(server)
      .post('/api/role.list')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        limit: 2,
      });
    expect(res.body).toMatchObject({
      ok: true,
    });
    expect(res.body.roles.length).toBe(2);

    const res1 = await request(server)
      .post('/api/role.list')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        limit: 1,
      });
    expect(res1.body).toMatchObject({
      ok: true,
      nextCursor: expect.any(String),
    });
    expect(res1.body.roles.length).toBe(1);
    expect(res1.body.roles[0]).toEqual(res.body.roles[0]);

    const res2 = await request(server)
      .post('/api/role.list')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        limit: 1,
        cursor: res1.body.nextCursor,
      });
    expect(res2.body).toMatchObject({
      ok: true,
    });
    expect(res2.body.roles.length).toBe(1);
    expect(res2.body.roles[0]).toEqual(res.body.roles[1]);
  });

  test('filters roles using `q` param', async () => {
    const res = await request(server)
      .post('/api/role.list')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        q: 'acme',
      });
    expect(res.body).toMatchObject({
      ok: true,
      roles: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          description: expect.any(String),
          isSystemRole: expect.any(Boolean),
          usersCount: expect.any(Number),
          permissions: expect.arrayContaining([expect.any(String)]),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      ]),
    });
  });

  test('filters roles using `scope` param', async () => {
    const res = await request(server)
      .post('/api/role.list')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        scope: acme.id,
      });
    expect(res.body).toMatchObject({
      ok: true,
      roles: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          description: expect.any(String),
          isSystemRole: expect.any(Boolean),
          usersCount: expect.any(Number),
          permissions: expect.arrayContaining([expect.any(String)]),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      ]),
    });
    expect(res.body.roles.length).toBe(1);
  });

  test('throws AuthorisationError when requesting a scope with no access', async () => {
    const res = await request(server)
      .post('/api/role.list')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        scope: umbrella.id,
      });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        // authorisation code
        code: 10012,
        message: expect.any(String),
      },
    });
  });

  test('filters roles using `isSystemRole` param', async () => {
    const res = await request(server)
      .post('/api/role.list')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        isSystemRole: true,
      });
    expect(res.body).toMatchObject({
      ok: true,
      roles: expect.arrayContaining([]),
    });
  });
});
