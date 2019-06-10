/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import config from '../../../../yeep.config';
import createUser from '../../user/create/service';
// import createOrg from '../../org/create/service';
import deleteUser from '../../user/delete/service';
// import deleteOrg from '../../org/delete/service';
import { issueSessionToken } from '../../session/issueToken/service';
import { destroySessionToken } from '../../session/destroyToken/service';

describe('api/totp.enroll', () => {
  let ctx;

  beforeAll(async () => {
    await server.setup(config);
    ctx = server.getAppContext();
  });

  afterAll(async () => {
    await server.teardown();
  });

  describe('unauthorized user', () => {
    test('returns error pretending resource does not exist', async () => {
      const res = await request(server)
        .post('/api/totp.enroll')
        .send();
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 404,
          message: 'Resource does not exist',
        },
      });
    });
  });

  describe('authorized user', () => {
    let wileUser;
    let wileSession;

    beforeAll(async () => {
      wileUser = await createUser(ctx, {
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

      wileSession = await issueSessionToken(ctx, {
        username: 'wile',
        password: 'catch-the-b1rd$',
      });
    });

    afterAll(async () => {
      await destroySessionToken(ctx, wileSession);
      await deleteUser(ctx, wileUser);
    });

    test('enrols user to TOTP authentication and returns secret key', async () => {
      const res = await request(server)
        .post('/api/totp.enroll')
        .set('Authorization', `Bearer ${wileSession.token}`)
        .send({
          userId: wileUser.id,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
        totp: {
          secret: expect.any(String),
          qrcode: expect.any(String),
          isPendingActivation: true,
        },
      });
    });
  });
});
