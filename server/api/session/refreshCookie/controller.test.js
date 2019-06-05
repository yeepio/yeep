/* eslint-env jest */
import request from 'supertest';
import cookie from 'cookie';
import { delay } from 'awaiting';
import server from '../../../server';
import config from '../../../../yeep.config';
import createUser from '../../user/create/service';
import deleteUser from '../../user/delete/service';
import { setSessionCookie } from '../setCookie/service';
import { AUTHENTICATION } from '../../../constants/tokenTypes';
import jwt from '../../../utils/jwt';

describe('api/session.refresh', () => {
  let ctx;
  let wile;

  beforeAll(async () => {
    await server.setup(config);
    ctx = server.getAppContext();

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
  });

  afterAll(async () => {
    await deleteUser(ctx, wile);
    await server.teardown();
  });

  test('refreshes accessToken and redeems refreshToken', async () => {
    const { cookie: prevCookie } = await setSessionCookie(ctx, {
      username: 'wile',
      password: 'catch-the-b1rd$',
    });

    const prevPayload = await jwt.verifyAsync(prevCookie, config.cookie.secret);
    await delay(1000); // let at least one second pass

    const res = await request(server)
      .post('/api/session.refreshCookie')
      .set('Cookie', `session=${prevCookie}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        ok: true,
      })
    );

    const nextCookie = res.header['set-cookie'][0];
    expect(nextCookie).toEqual(expect.any(String));

    const nextCookieObj = cookie.parse(nextCookie);
    expect(nextCookieObj.session).toEqual(expect.any(String));

    const nextPayload = await jwt.verifyAsync(nextCookieObj.session, config.cookie.secret);
    expect(nextPayload.exp).toBeGreaterThan(prevPayload.exp);
    expect(nextPayload.iat).toBeGreaterThan(prevPayload.iat);

    const TokenModel = ctx.db.model('Token');
    expect(
      TokenModel.countDocuments({
        secret: prevPayload.jti,
        type: AUTHENTICATION,
      })
    ).resolves.toBe(0);
  });
});
