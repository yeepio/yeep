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
// import createPermission from '../../permission/create/service';
// import createRole from '../create/service';
// import deleteRole from '../delete/service';
// import deletePermission from '../../permission/delete/service';

describe('api/user.list', () => {
  let ctx;

  beforeAll(async () => {
    await server.setup(config);
    ctx = server.getAppContext();
  });

  afterAll(async () => {
    await server.teardown();
  });

  describe('unauthorized user', () => {
    test('returns error pretending resource does not exist', async () => {
      const res = await request(server)
        .post('/api/user.list')
        .send();
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 404,
          message: 'Resource does not exist',
        },
      });
    });
  });

  describe('authorized user', () => {
    let wile;
    let porky;
    let wazowski;
    let spongebob;
    let acme;
    let monsters;
    let session;

    beforeAll(async () => {
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

      // create test users
      porky = await createUser(ctx, {
        username: 'porky',
        password: "Th-th-th-that's all folks!",
        fullName: 'Porky Pig',
        picture: 'https://www.acme.com/pictures/porky.png',
        emails: [
          {
            address: 'porky@acme.com',
            isVerified: true,
            isPrimary: true,
          },
        ],
        orgs: [acme.id],
      });

      wazowski = await createUser(ctx, {
        username: 'wazowski',
        password: 'grrrrrrrrrrr',
        fullName: 'Mike Wazowski',
        picture: 'https://www.monstersinc.com/pictures/wazowski.png',
        emails: [
          {
            address: 'wazowski@monstersinc.com',
            isVerified: true,
            isPrimary: true,
          },
        ],
        orgs: [monsters.id],
      });

      spongebob = await createUser(ctx, {
        username: 'spongebob',
        password: 'weeeeedddd',
        fullName: 'SpongeBob SquarePants',
        picture: 'https://www.squarepants.com/spongebob.jpg',
        emails: [
          {
            address: 'spongebob@squarepants.com',
            isVerified: true,
            isPrimary: true,
          },
        ],
        // note the absense of an org
      });

      // user "wile" is logged-in
      session = await createSession(ctx, {
        username: 'wile',
        password: 'catch-the-b1rd$',
      });
    });

    afterAll(async () => {
      await destroySession(ctx, session);
      await deleteUser(ctx, wile);
      await deleteUser(ctx, porky);
      await deleteUser(ctx, wazowski);
      await deleteUser(ctx, spongebob);
      await deleteOrg(ctx, acme);
      await deleteOrg(ctx, monsters);
    });

    test('returns list of users the requestor has access to', async () => {
      const res = await request(server)
        .post('/api/user.list')
        .set('Authorization', `Bearer ${session.accessToken}`)
        .send();

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
        users: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            username: expect.any(String),
            fullName: expect.any(String),
            picture: expect.any(String),
            emails: [
              {
                address: expect.any(String),
                isVerified: true,
                isPrimary: true,
              },
            ],
            orgs: expect.arrayContaining([expect.any(String)]),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        ]),
      });
      expect(res.body.users.length).toBe(3);
      expect(res.body.users.findIndex((user) => user.username === 'wazowski')).not.toBe(-1);
      expect(res.body.users.findIndex((user) => user.username === 'wile')).not.toBe(-1);
      expect(res.body.users.findIndex((user) => user.username === 'porky')).not.toBe(-1);
      expect(res.body.users.findIndex((user) => user.username === 'squarepants')).toBe(-1);
    });

    test('limits number of users using `limit` param', async () => {
      const res = await request(server)
        .post('/api/user.list')
        .set('Authorization', `Bearer ${session.accessToken}`)
        .send({
          limit: 1,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
        users: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            username: expect.any(String),
            fullName: expect.any(String),
            picture: expect.any(String),
            emails: [
              {
                address: expect.any(String),
                isVerified: true,
                isPrimary: true,
              },
            ],
            orgs: expect.arrayContaining([expect.any(String)]),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        ]),
        nextCursor: expect.any(String),
      });
      expect(res.body.users.length).toBe(1);
    });

    test('paginates through users using `cursor` param', async () => {
      const res = await request(server)
        .post('/api/user.list')
        .set('Authorization', `Bearer ${session.accessToken}`)
        .send({
          limit: 2,
        });
      expect(res.body).toMatchObject({
        ok: true,
      });
      expect(res.body.users.length).toBe(2);

      const res1 = await request(server)
        .post('/api/user.list')
        .set('Authorization', `Bearer ${session.accessToken}`)
        .send({
          limit: 1,
        });
      expect(res1.body).toMatchObject({
        ok: true,
        nextCursor: expect.any(String),
      });
      expect(res1.body.users.length).toBe(1);
      expect(res1.body.users[0]).toEqual(res.body.users[0]);

      const res2 = await request(server)
        .post('/api/user.list')
        .set('Authorization', `Bearer ${session.accessToken}`)
        .send({
          limit: 1,
          cursor: res1.body.nextCursor,
        });
      expect(res2.body).toMatchObject({
        ok: true,
      });
      expect(res2.body.users.length).toBe(1);
      expect(res2.body.users[0]).toEqual(res.body.users[1]);
    });

    test('filters users using `q` param', async () => {
      const res = await request(server)
        .post('/api/user.list')
        .set('Authorization', `Bearer ${session.accessToken}`)
        .send({
          q: 'por',
        });
      expect(res.body).toMatchObject({
        ok: true,
        users: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            username: 'porky',
            fullName: expect.any(String),
            picture: expect.any(String),
            emails: [
              {
                address: expect.any(String),
                isVerified: true,
                isPrimary: true,
              },
            ],
            orgs: expect.arrayContaining([expect.any(String)]),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        ]),
      });
      expect(res.body.users.length).toBe(1);
    });

    test('filters users using `org` param', async () => {
      const res = await request(server)
        .post('/api/user.list')
        .set('Authorization', `Bearer ${session.accessToken}`)
        .send({
          org: monsters.id,
        });
      expect(res.body).toMatchObject({
        ok: true,
        users: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            username: 'wazowski',
            fullName: expect.any(String),
            picture: expect.any(String),
            emails: [
              {
                address: expect.any(String),
                isVerified: true,
                isPrimary: true,
              },
            ],
            orgs: expect.arrayContaining([expect.any(String)]),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        ]),
      });
      expect(res.body.users.length).toBe(2);
      expect(res.body.users.findIndex((user) => user.username === 'wazowski')).not.toBe(-1);
      expect(res.body.users.findIndex((user) => user.username === 'wile')).not.toBe(-1);
    });

    test('projects user props using `projection` param', async () => {
      const res = await request(server)
        .post('/api/user.list')
        .set('Authorization', `Bearer ${session.accessToken}`)
        .send({
          projection: {
            emails: false,
            updatedAt: false,
          },
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
        users: expect.arrayContaining([
          expect.not.objectContaining({
            emails: [
              {
                address: expect.any(String),
                isVerified: true,
                isPrimary: true,
              },
            ],
            updatedAt: expect.any(String),
          }),
        ]),
      });
    });

    describe('without permission', () => {
      let otherSession;

      beforeAll(async () => {
        // user "spongebob" is logged-in
        otherSession = await createSession(ctx, {
          username: 'spongebob',
          password: 'weeeeedddd',
        });
      });

      afterAll(async () => {
        await destroySession(ctx, otherSession);
      });

      test('returns empty list of users', async () => {
        const res = await request(server)
          .post('/api/user.list')
          .set('Authorization', `Bearer ${otherSession.accessToken}`)
          .send();

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
          ok: true,
          users: [],
        });
      });

      test('returns authorization error when trying to filter by org id', async () => {
        const res = await request(server)
          .post('/api/user.list')
          .set('Authorization', `Bearer ${otherSession.accessToken}`)
          .send({
            org: monsters.id,
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
  });
});
