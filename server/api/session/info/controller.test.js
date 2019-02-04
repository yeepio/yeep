/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import config from '../../../../yeep.config';
import deleteUser from '../../user/delete/service';
import createUser from '../../user/create/service';
import createSessionToken from '../create/service';
import destroySessionToken from '../destroy/service';

describe('api/v1/session.info', () => {
  let ctx;
  let user;
  let session;

  beforeAll(async () => {
    await server.setup(config);
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

    session = await createSessionToken(ctx, {
      username: 'wile',
      password: 'catch-the-b1rd$',
    });
  });

  afterAll(async () => {
    await destroySessionToken(ctx.db, session);
    await deleteUser(ctx.db, user);
    await server.teardown();
  });

  test('returns session info as expected', async () => {
    const res = await request(server)
      .post('/api/v1/session.info')
      .set('Authorization', `Bearer ${session.token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        ok: true,
      })
    );
  });
});
