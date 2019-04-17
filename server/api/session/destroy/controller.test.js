/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import config from '../../../../yeep.config';
import createUser from '../../user/create/service';
import createSession from '../create/service';
import deleteUser from '../../user/delete/service';
import { AUTHENTICATION, SESSION_REFRESH } from '../../../constants/tokenTypes';

describe('api/session.destroy', () => {
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
    const { accessToken, refreshToken } = await createSession(ctx, {
      username: 'wile',
      password: 'catch-the-b1rd$',
    });
    const payload = await ctx.jwt.verify(accessToken);

    const res = await request(server)
      .post('/api/session.destroy')
      .send({
        accessToken,
        refreshToken,
      });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
    });

    const TokenModel = ctx.db.model('Token');
    expect(
      TokenModel.countDocuments({
        secret: payload.jti,
        type: AUTHENTICATION,
      })
    ).resolves.toBe(0);
    expect(
      TokenModel.countDocuments({
        secret: refreshToken,
        type: SESSION_REFRESH,
      })
    ).resolves.toBe(0);
  });
});
