/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import deleteUser from '../../user/delete/service';
import createUser from '../../user/create/service';
import createSessionToken from '../create/service';
import destroySessionToken from '../destroy/service';

describe('api/v1/session.info', () => {
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

    ctx.session = await createSessionToken(ctx.db, ctx.jwt, {
      username: 'wile',
      password: 'catch-the-b1rd$',
    });
  });

  afterAll(async () => {
    await destroySessionToken(ctx.db, ctx.session);
    await deleteUser(ctx.db, ctx.user);
    await server.teardown();
  });

  test('returns session info as expected', async () => {
    const res = await request(server)
      .post('/api/v1/session.info')
      .set('Authorization', `Bearer ${ctx.session.token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        ok: true,
      })
    );
  });
});
