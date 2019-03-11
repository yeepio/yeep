/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import config from '../../../../yeep.config';
import createUser from '../../user/create/service';
import createOrg from '../../org/create/service';
import createSession from '../../session/create/service';
import destroySession from '../../session/destroy/service';
import deleteOrg from '../../org/delete/service';
import deleteUser from '../../user/delete/service';

describe('api/v1/org.list', () => {
  let ctx;
  let wile;
  let oswell;
  let acme;
  let monsters;
  let umbrella;
  let session;

  beforeAll(async () => {
    await server.setup(config);
    ctx = server.getAppContext();

    // user "wile" is admin in acme + monsters org
    [wile, oswell] = await Promise.all([
      createUser(ctx.db, {
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
      }),
      createUser(ctx.db, {
        username: 'oswell',
        password: 'our-business-$s-l1f3-1ts3lf',
        fullName: 'Oswell E. Spencer',
        picture: 'https://www.umbrella.com/pictures/spencer.png',
        emails: [
          {
            address: 'oswellspencer@umbrella.com',
            isVerified: true,
            isPrimary: true,
          },
        ],
      })
    ]);

    [acme, monsters, umbrella] = await Promise.all([
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
      createOrg(ctx.db, {
        name: 'Umbrella Corp',
        slug: 'umbrella',
      }),
    ]);

    // user "wile" is logged-in
    session = await createSession(ctx, {
      username: 'wile',
      password: 'catch-the-b1rd$',
    });
  });

  afterAll(async () => {
    await destroySession(ctx, session);
    await deleteUser(ctx.db, wile);
    await deleteUser(ctx.db, oswell);
    await deleteOrg(ctx.db, acme);
    await deleteOrg(ctx.db, monsters);
    await deleteOrg(ctx.db, umbrella);
    await server.teardown();
  });

  test('returns list of orgs the user has access to', async () => {
    const res = await request(server)
      .post('/api/v1/org.list')
      .set('Authorization', `Bearer ${session.accessToken}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.orgs.length).toBe(2);
    expect(res.body).toMatchObject({
      ok: true,
      orgs: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          slug: expect.any(String),
          usersCount: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      ]),
    });
    expect(res.body.orgs.length).toBe(2);
  });

  test('limits number of orgs using `limit` param', async () => {
    const res = await request(server)
      .post('/api/v1/org.list')
      .set('Authorization', `Bearer ${session.accessToken}`)
      .send({
        limit: 1,
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      orgs: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          slug: expect.any(String),
          usersCount: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      ]),
      nextCursor: expect.any(String),
    });
    expect(res.body.orgs.length).toBe(1);
  });

  test('paginates through orgs using `cursor` param', async () => {
    const res = await request(server)
      .post('/api/v1/org.list')
      .set('Authorization', `Bearer ${session.accessToken}`)
      .send({
        limit: 2,
      });
    expect(res.body).toMatchObject({
      ok: true,
    });
    expect(res.body.orgs.length).toBe(2);

    const res1 = await request(server)
      .post('/api/v1/org.list')
      .set('Authorization', `Bearer ${session.accessToken}`)
      .send({
        limit: 1,
      });
    expect(res1.body).toMatchObject({
      ok: true,
      nextCursor: expect.any(String),
    });
    expect(res1.body.orgs.length).toBe(1);
    expect(res1.body.orgs[0]).toEqual(res.body.orgs[0]);

    const res2 = await request(server)
      .post('/api/v1/org.list')
      .set('Authorization', `Bearer ${session.accessToken}`)
      .send({
        limit: 1,
        cursor: res1.body.nextCursor,
      });
    expect(res2.body).toMatchObject({
      ok: true,
    });
    expect(res2.body.orgs.length).toBe(1);
    expect(res2.body.orgs[0]).toEqual(res.body.orgs[1]);
  });

  test('filters orgs using `q` param', async () => {
    const res = await request(server)
      .post('/api/v1/org.list')
      .set('Authorization', `Bearer ${session.accessToken}`)
      .send({
        q: 'acme',
      });
    expect(res.body).toMatchObject({
      ok: true,
      orgs: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          slug: expect.any(String),
          usersCount: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      ]),
    });
  });

  // test('filters orgs using `user` param', async () => {
  //   const res = await request(server)
  //     .post('/api/v1/org.list')
  //     .set('Authorization', `Bearer ${session.accessToken}`)
  //     .send({
  //       user: wile.id,
  //     });
  //   expect(res.body).toMatchObject({
  //     ok: true,
  //     orgs: expect.arrayContaining([
  //       expect.objectContaining({
  //         id: expect.any(String),
  //         name: expect.any(String),
  //         description: expect.any(String),
  //         isSystemRole: expect.any(Boolean),
  //         usersCount: expect.any(Number),
  //         permissions: expect.arrayContaining([expect.any(String)]),
  //         createdAt: expect.any(String),
  //         updatedAt: expect.any(String),
  //       }),
  //     ]),
  //   });
  //   expect(res.body.orgs.length).toBe(1);
  // });

  test('throws AuthorisationError when requesting organisations of a user with no access', async () => {
    const res = await request(server)
      .post('/api/v1/org.list')
      .set('Authorization', `Bearer ${session.accessToken}`)
      .send({
        user: oswell.id,
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
});
