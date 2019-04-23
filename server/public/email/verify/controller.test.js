/* eslint-env jest */
import request from 'supertest';
import { event } from 'awaiting';
import server from '../../../server';
import config from '../../../../yeep.config';
import createUser from '../../../api/user/create/service';
import deleteUser from '../../../api/user/delete/service';
import initEmailVerification from '../../../api/user/verifyEmail/service';

describe('public/verify-email', () => {
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
    let unverifiedEmail = {
      address: 'coyote-unverified@acme.com',
      isVerified: false,
      isPrimary: false,
    };
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
          {
            ...unverifiedEmail,
          },
        ],
      });
    });

    afterAll(async () => {
      await deleteUser(ctx, wile);
    });

    test('verifies email and returns expected response', async () => {
      const eventTrigger = event(ctx.bus, 'email_verification_init');

      await initEmailVerification(ctx, wile, {
        emailAddress: unverifiedEmail.address,
        tokenExpiresInSeconds: 60,
      });

      const data = await eventTrigger;
      const token = data[0].token.secret;

      const f = jest.fn();
      ctx.bus.once('email_verification_success', f);

      const res = await request(server).get(`/verify-email?token=${token}`);
      expect(res.status).toEqual(200);
      expect(res.type).toMatch(/html/);

      expect(res.text).toMatch(/Verified your Email Succesfully/);

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

    test('returns error when no token exists', async () => {
      const res = await request(server).get('/verify-email');

      expect(res.status).toEqual(200);
      expect(res.type).toMatch(/html/);

      expect(res.text).toMatch(/Error while verifying your Email/);
      expect(res.text).toMatch(/Missing or invalid token/);
    });
  });
});