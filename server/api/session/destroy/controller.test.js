/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import createUser from '../../user/create/service';
import createSession from '../create/service';
import deleteUser from '../../user/delete/service';

describe('api/v1/session.destroy', () => {
  let ctx;

  beforeAll(async () => {
    await server.setup();
    ctx = server.getAppContext();

    ctx.user = await createUser(ctx.db, {
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
  });

  afterAll(async () => {
    await deleteUser(ctx.db, ctx.user);
    await server.teardown();
  });

  test('destroys session and responds as expected', async () => {
    const session = await createSession(ctx.db, ctx.jwt, {
      username: 'wile',
      password: 'catch-the-b1rd$',
    });

    const res = await request(server)
      .post('/api/v1/session.destroy')
      .set('Authorization', `Bearer ${session.token}`)
      .send();
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
    });
  });
});
