/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import config from '../../../../yeep.config';
import deleteUser from '../../user/delete/service';
import deleteOrg from '../../org/delete/service';
import createUser from '../../user/create/service';
import createOrg from '../../org/create/service';

describe('api/idp.list', () => {
  let ctx;
  let wileUser;
  let acmeOrg;

  beforeAll(async () => {
    await server.setup(config);
    ctx = server.getAppContext();

    wileUser = await createUser(ctx, {
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

    acmeOrg = await createOrg(ctx, {
      name: 'Acme Inc',
      slug: 'acme',
      adminId: wileUser.id,
    });
  });

  afterAll(async () => {
    await deleteOrg(ctx, acmeOrg);
    await deleteUser(ctx, wileUser);
    await server.teardown();
  });

  test('returns error when payload contains unknown properties', async () => {
    const res = await request(server)
      .post('/api/idp.list')
      .send({
        foo: 'bar',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 400,
        message: 'Invalid request body',
        details: expect.any(Array),
      },
    });
    expect(res.body.error.details[0].path).toEqual(['foo']);
    expect(res.body.error.details[0].type).toBe('object.allowUnknown');
  });

  test('returns error when org does not exist', async () => {
    const res = await request(server)
      .post('/api/idp.list')
      .send({
        org: '5b2d5dd0cd86b77258e16d39', // some random objectid
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10011,
        message: 'Org 5b2d5dd0cd86b77258e16d39 does not exist',
      },
    });
  });

  test('returns empty array of identity providers', async () => {
    const res = await request(server)
      .post('/api/idp.list')
      .send();

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      identityProviders: [],
    });
  });

  // test('returns empty array of identity providers', async () => {
  //   const res = await request(server)
  //     .post('/api/idp.list')
  //     .send();

  //   expect(res.status).toBe(200);
  //   expect(res.body).toMatchObject({
  //     ok: true,
  //     identityProviders: expect.arrayContaining([
  //       expect.objectContaining({
  //         id: expect.any(String),
  //         name: expect.any(String),
  //         type: expect.any(String),
  //         protocol: expect.any(String),
  //         logo: expect.objectContaining({
  //           mime: expect.any(String),
  //           extension: expect.any(String),
  //           value: expect.any(String),
  //         }),
  //         org: expect.objectContaining({
  //           id: expect.any(String),
  //         }),
  //         createdAt: expect.any(String),
  //         updatedAt: expect.any(String),
  //       }),
  //     ]),
  //   });
  // });
});
