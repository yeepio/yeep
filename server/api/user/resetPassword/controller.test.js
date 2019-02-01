/* eslint-env jest */
import request from 'supertest';
import { event } from 'awaiting';
import server from '../../../server';
import config from '../../../../yeep.config';
import createUser from '../create/service';
import deleteUser from '../delete/service';
import initPasswordReset from '../forgotPassword/service';

describe('api/v1/user.resetPassword', () => {
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
    });

    test('resets password and returns expected response', async () => {
      const eventTrigger = event(ctx.bus, 'password_reset_init');

      await initPasswordReset(ctx.db, ctx.bus, {
        username: 'wile',
        tokenExpiresInSeconds: 60,
      });

      const data = await eventTrigger;
      const token = data[0].token.secret;

      const f = jest.fn();
      ctx.bus.once('password_reset_success', f);

      const res = await request(server)
        .post('/api/v1/user.resetPassword')
        .send({
          token,
          password: 'catch-the-b2rd$',
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
        user: {
          id: expect.any(String),
          updatedAt: expect.any(String),
        },
      });

      expect(f).toHaveBeenCalledWith({
        user: expect.objectContaining({
          id: expect.any(String),
          fullName: expect.any(String),
          emailAddress: expect.any(String),
          picture: expect.any(String),
        }),
      });

      const TokenModel = ctx.db.model('Token');
      const tokenRecord = await TokenModel.findOne({
        secret: token,
      });
      expect(tokenRecord).toBeNull();
    });

    test('returns error when token contains less than 6 characters', async () => {
      const res = await request(server)
        .post('/api/v1/user.resetPassword')
        .send({
          token: 'abcde',
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

    test('returns error when password is missing', async () => {
      const res = await request(server)
        .post('/api/v1/user.resetPassword')
        .send({
          token: 'abcdef',
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

    test('returns error when password contains less than 8 characters', async () => {
      const res = await request(server)
        .post('/api/v1/user.resetPassword')
        .send({
          token: 'abcdef',
          password: '1234567',
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

    test('returns error when payload contains unknown properties', async () => {
      const res = await request(server)
        .post('/api/v1/user.resetPassword')
        .send({
          token: 'abcdef',
          password: '12345678',
          foo: 'bar',
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
      expect(res.body.error.details[0].path).toEqual(['foo']);
      expect(res.body.error.details[0].type).toBe('object.allowUnknown');
    });
  });
});
