/* eslint-env jest */
import request from 'supertest';
import isWithinRange from 'date-fns/is_within_range';
import addSeconds from 'date-fns/add_seconds';
import server from '../../../server';
import config from '../../../../yeep.config';
import createUser from '../create/service';
import deleteUser from '../delete/service';
import { PASSWORD_RESET } from '../../../constants/tokenTypes';

describe('api/user.forgotPassword', () => {
  let ctx;

  beforeAll(async () => {
    await server.setup(config);
    ctx = server.getAppContext();
  });

  afterAll(async () => {
    await server.teardown();
  });

  describe('unauthorized user', () => {
    let wile;

    beforeAll(async () => {
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
    });

    test('initiates forgot-password process and returns expected response', async () => {
      const f = jest.fn();
      ctx.bus.once('password_reset_init', f);

      const startDate = new Date();
      let res = await request(server)
        .post('/api/user.forgotPassword')
        .send({
          userKey: 'wile',
          tokenExpiresInSeconds: 4 * 60 * 60, // i.e. 4 hours
        });
      const endDate = new Date();

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
      });

      expect(f).toHaveBeenCalledWith({
        user: expect.objectContaining({
          id: expect.any(String),
          fullName: expect.any(String),
          emailAddress: expect.any(String),
          picture: expect.any(String),
        }),
        token: expect.objectContaining({
          id: expect.any(String),
          secret: expect.any(String),
          type: PASSWORD_RESET,
          createdAt: expect.any(Date),
          expiresAt: expect.any(Date),
        }),
      });

      expect(
        isWithinRange(
          f.mock.calls[0][0].token.expiresAt,
          startDate,
          addSeconds(endDate, 4 * 60 * 60)
        )
      ).toEqual(true);
    });

    test('returns error when username is invalid', async () => {
      const res = await request(server)
        .post('/api/user.forgotPassword')
        .send({
          userKey: 'a',
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
    });

    test('returns error when email does not exist', async () => {
      const res = await request(server)
        .post('/api/user.forgotPassword')
        .send({
          userKey: 'unknown@email.com',
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10001,
          message: expect.any(String),
        },
      });
    });

    test('returns error when username does not exist', async () => {
      const res = await request(server)
        .post('/api/user.forgotPassword')
        .send({
          userKey: 'notuser',
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10001,
          message: expect.any(String),
        },
      });
    });

    test('returns error when tokenExpiresInSeconds is invalid', async () => {
      const res = await request(server)
        .post('/api/user.forgotPassword')
        .send({
          tokenExpiresInSeconds: 'NaN',
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 400,
          message: 'Invalid request body',
        },
      });
    });
  });
});
