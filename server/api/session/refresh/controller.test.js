/* eslint-env jest */
import request from 'supertest';
import { delay } from 'awaiting';
import server from '../../../server';
import config from '../../../../yeep.config';
import createUser from '../../user/create/service';
import deleteUser from '../../user/delete/service';
import createSession from '../create/service';

describe('api/session.refresh', () => {
  let ctx;
  let wile;

  beforeAll(async () => {
    await server.setup(config);
    ctx = server.getAppContext();

    wile = await createUser(ctx.db, {
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
    await deleteUser(ctx.db, wile);
    await server.teardown();
  });

  test('refreshes accessToken and redeems refreshToken', async () => {
    const { accessToken, refreshToken } = await createSession(ctx, {
      username: 'wile',
      password: 'catch-the-b1rd$',
    });

    const prevPayload = await ctx.jwt.verify(accessToken);
    await delay(1000); // let at least one second pass

    const res = await request(server)
      .post('/api/session.refresh')
      .send({
        accessToken,
        refreshToken,
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        ok: true,
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      })
    );

    const nextPayload = await ctx.jwt.verify(res.body.accessToken);
    expect(nextPayload.exp).toBeGreaterThan(prevPayload.exp);
    expect(nextPayload.iat).toBeGreaterThan(prevPayload.iat);

    const TokenModel = ctx.db.model('Token');
    expect(
      TokenModel.countDocuments({
        secret: prevPayload.jti,
        type: 'AUTHENTICATION',
      })
    ).resolves.toBe(0);
    expect(
      TokenModel.countDocuments({
        secret: refreshToken,
        type: 'SESSION_REFRESH',
      })
    ).resolves.toBe(0);
  });

  test('throws error when refreshToken is not applicable to the supplied accessToken', async () => {
    const { accessToken } = await createSession(ctx, {
      username: 'wile',
      password: 'catch-the-b1rd$',
    });
    const { refreshToken } = await createSession(ctx, {
      username: 'wile',
      password: 'catch-the-b1rd$',
    });

    const res = await request(server)
      .post('/api/session.refresh')
      .send({
        accessToken,
        refreshToken,
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        ok: false,
        error: { code: 10030, message: expect.any(String) },
      })
    );
  });
});
