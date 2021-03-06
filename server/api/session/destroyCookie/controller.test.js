/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import config from '../../../../yeep.config';
import createUser from '../../user/create/service';
import { createSession } from '../issueToken/service';
import { signCookieJWT } from '../setCookie/service';
import deleteUser from '../../user/delete/service';
import { AUTHENTICATION } from '../../../constants/tokenTypes';
import jwt from '../../../utils/jwt';

describe('api/session.destroyCookie', () => {
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
    const session = await createSession(ctx, {
      username: 'wile',
      password: 'catch-the-b1rd$',
    });
    const cookie = await signCookieJWT(ctx, session);

    const res = await request(server)
      .post('/api/session.destroyCookie')
      .set('Cookie', `session=${cookie}`)
      .send();
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
    });

    const TokenModel = ctx.db.model('Token');
    const payload = await jwt.verifyAsync(cookie, config.session.cookie.secret, {
      issuer: config.name,
      algorithm: 'HS512',
    });

    expect(
      TokenModel.countDocuments({
        secret: payload.jti,
        type: AUTHENTICATION,
      })
    ).resolves.toBe(0);
  });
});
