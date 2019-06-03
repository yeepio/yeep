/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import config from '../../../../yeep.config';
import createUser from '../../user/create/service';
import { setSessionCookie } from '../setCookie/service';
import deleteUser from '../../user/delete/service';
import { AUTHENTICATION } from '../../../constants/tokenTypes';

describe('api/session.removeCookie', () => {
  let ctx;
  let user;

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
  });

  afterAll(async () => {
    await deleteUser(ctx, user);
    await server.teardown();
  });

  test('destroys session and responds as expected', async () => {
    const { cookie } = await setSessionCookie(ctx, {
      username: 'wile',
      password: 'catch-the-b1rd$',
    });

    const res = await request(server)
      .post('/api/session.removeCookie')
      .set('Cookie', cookie)
      .send();
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
    });

    const TokenModel = ctx.db.model('Token');
    const payload = await ctx.jwt.verify(cookie);
    expect(
      TokenModel.countDocuments({
        secret: payload.jti,
        type: AUTHENTICATION,
      })
    ).resolves.toBe(0);
  });
});
