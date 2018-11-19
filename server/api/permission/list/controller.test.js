/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import config from '../../../../yeep.config';
import createUser from '../../user/create/service';
import createOrg from '../../org/create/service';
import createSessionToken from '../../session/create/service';
import destroySessionToken from '../../session/destroy/service';
import deleteOrg from '../../org/delete/service';
import deleteUser from '../../user/delete/service';
import createPermission from '../create/service';
import deletePermission from '../delete/service';

describe('api/v1/permission.list', () => {
  let ctx;
  let wile;
  let acme;
  let monsters;
  let permissions;
  let session;

  beforeAll(async () => {
    await server.setup(config);
    ctx = server.getAppContext();

    wile = await createUser(ctx.db, {
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
      createOrg(ctx.db, {
        name: 'Acme Inc',
        slug: 'acme',
        adminId: wile.id,
      }),
      createOrg(ctx.db, {
        name: 'Monsters Inc',
        slug: 'monsters',
        adminId: wile.id,
      }),
    ]);

    // create test permission
    permissions = await Promise.all([
      await createPermission(ctx.db, {
        name: 'acme.code.write',
        description: 'Permission to edit (write, delete, update) source code',
        scope: acme.id,
      }),
      await createPermission(ctx.db, {
        name: 'monsters.code.write',
        description: 'Permission to edit (write, delete, update) source code',
        scope: monsters.id,
      }),
    ]);

    session = await createSessionToken(ctx.db, ctx.jwt, {
      username: 'wile',
      password: 'catch-the-b1rd$',
    });
  });

  afterAll(async () => {
    await destroySessionToken(ctx.db, session);
    await Promise.all(permissions.map((permission) => deletePermission(ctx.db, permission)));
    await deleteOrg(ctx.db, acme);
    await deleteOrg(ctx.db, monsters);
    await deleteUser(ctx.db, wile);
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
});
