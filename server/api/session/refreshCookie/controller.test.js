/* eslint-env jest */
import request from 'supertest';
import cookie from 'cookie';
import { delay } from 'awaiting';
import server from '../../../server';
import config from '../../../../yeep.config';
import createUser from '../../user/create/service';
import deleteUser from '../../user/delete/service';
import { createSession } from '../issueToken/service';
import { signCookieJWT } from '../setCookie/service';
import { AUTHENTICATION, EXCHANGE } from '../../../constants/tokenTypes';
import jwt from '../../../utils/jwt';

describe('api/session.refreshCookie', () => {
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

  test('refreshes session cookie while avoiding race conditions', async () => {
    const session = await createSession(ctx, {
      username: 'wile',
      password: 'catch-the-b1rd$',
    });
    const { token: sessionCookie } = await signCookieJWT(ctx, session);

    const payload = await jwt.verifyAsync(sessionCookie, config.session.cookie.secret);
    await delay(1000); // let at least one second pass

    const [res1, res2] = await Promise.all([
      request(server)
        .post('/api/session.refreshCookie')
        .set('Cookie', `session=${sessionCookie}`)
        .send(),
      request(server)
        .post('/api/session.refreshCookie')
        .set('Cookie', `session=${sessionCookie}`)
        .send(),
    ]);

    expect(res1.status).toBe(200);
    expect(res1.body).toEqual(
      expect.objectContaining({
        ok: true,
      })
    );

    const nextCookie = res1.header['set-cookie'][0];
    expect(nextCookie).toEqual(expect.any(String));

    const nextCookieProps = cookie.parse(nextCookie);
    expect(nextCookieProps.session).toEqual(expect.any(String));

    const nextPayload = await jwt.verifyAsync(
      nextCookieProps.session,
      config.session.cookie.secret
    );
    expect(nextPayload.exp).toBeGreaterThan(payload.exp);
    expect(nextPayload.iat).toBeGreaterThan(payload.iat);

    const TokenModel = ctx.db.model('Token');
    expect(
      TokenModel.countDocuments({
        secret: payload.jti,
        type: AUTHENTICATION,
      })
    ).resolves.toBe(0);
    expect(
      TokenModel.countDocuments({
        secret: payload.jti,
        type: EXCHANGE,
      })
    ).resolves.toBe(1);
    expect(
      TokenModel.countDocuments({
        secret: nextPayload.jti,
        type: AUTHENTICATION,
      })
    ).resolves.toBe(1);

    expect(res1.header['set-cookie'][0]).toBe(res2.header['set-cookie'][0]);
    expect(res1.body).toEqual(res2.body);
  });
});
