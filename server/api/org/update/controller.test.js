/* eslint-env jest */
import request from 'supertest';
import compareDesc from 'date-fns/compare_desc';
import server from '../../../server';
import config from '../../../../yeep.config';
import createOrg from '../create/service';
import createUser from '../../user/create/service';
import { createSession, signBearerJWT } from '../../session/issueToken/service';
import { destroySession } from '../../session/destroyToken/service';
import deleteOrg from '../delete/service';
import deleteUser from '../../user/delete/service';

describe('api/org.update', () => {
  let ctx;
  let user;
  let acmeOrg;
  let unauthorisedOrg;
  let umbrellaOrg;
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

    [acmeOrg, unauthorisedOrg, umbrellaOrg] = await Promise.all([
      createOrg(ctx, {
        name: 'Acme Inc',
        slug: 'acme',
        adminId: user.id,
      }),
      createOrg(ctx, {
        name: 'DANGER_ZONE',
        slug: 'donotenter',
      }),
      createOrg(ctx, {
        name: 'Umbrella Corp',
        slug: 'umbrella',
        adminId: user.id,
      }),
    ]);

    session = await createSession(ctx, {
      username: 'wile',
      password: 'catch-the-b1rd$',
    });
    bearerToken = await signBearerJWT(ctx, session);
  });

  afterAll(async () => {
    await destroySession(ctx, session);
    await deleteOrg(ctx, acmeOrg);
    await deleteOrg(ctx, unauthorisedOrg);
    await deleteOrg(ctx, umbrellaOrg);
    await deleteUser(ctx, user);
    await server.teardown();
  });

  test('returns error when org does not exist', async () => {
    const res = await request(server)
      .post('/api/org.update')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        id: '5b2d5dd0cd86b77258e16d39', // some random objectid
        name: 'Acme Tost',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10011,
        message: 'Org 5b2d5dd0cd86b77258e16d39 cannot be found',
      },
    });
  });

  test('returns error when requestor has no write permissions on requested org', async () => {
    const res = await request(server)
      .post('/api/org.update')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        id: unauthorisedOrg.id,
        name: 'Acme Tost',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10012,
        message: `User ${user.id} is not authorized to update org ${unauthorisedOrg.id}`,
      },
    });
  });

  test('returns error when neither slug nor name are present on the request', async () => {
    const res = await request(server)
      .post('/api/org.update')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        id: acmeOrg.id, // some random objectid
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 400,
        details: [
          {
            path: ['name'],
            type: 'any.required',
          },
        ],
        message: 'Invalid request body',
      },
    });
  });

  test('updates org and returns expected response', async () => {
    const res = await request(server)
      .post('/api/org.update')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        id: umbrellaOrg.id,
        name: 'Umbrella Tost',
        slug: 'umbrulla',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      org: {
        id: umbrellaOrg.id,
        name: 'Umbrella Tost',
        slug: 'umbrulla',
      },
    });
    expect(compareDesc(acmeOrg.createdAt, res.body.org.createdAt)).toBe(0);
    expect(compareDesc(acmeOrg.updatedAt, res.body.org.updatedAt)).toBe(1);
  });
});
