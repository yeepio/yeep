/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import config from '../../../../yeep.config';
import createOrg from '../../org/create/service';
import createUser from '../create/service';
import createPermissionAssignment from '../assignPermission/service';
import { createSession, signBearerJWT } from '../../session/issueToken/service';
import { destroySession } from '../../session/destroyToken/service';
import deletePermissionAssignment from '../revokePermission/service';
import deleteOrg from '../../org/delete/service';
import deleteUser from '../delete/service';

describe('api/user.update', () => {
  let ctx;
  let user;
  let existingUser;
  let superuser;
  let unauthorisedUser;
  let org;
  let permissionAssignment;
  let session;
  let bearerToken;
  let unauthorisedSession;
  let unauthorisedBearerToken;
  let superuserSession;
  let superuserBearerToken;

  beforeAll(async () => {
    await server.setup(config);
    ctx = server.getAppContext();

    [user, existingUser, superuser] = await Promise.all([
      createUser(ctx, {
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
      }),
      createUser(ctx, {
        username: 'oswell',
        password: 'our-business-$s-l1f3-1ts3lf',
        fullName: 'Oswell E. Spencer',
        picture: 'https://www.umbrella.com/pictures/spencer.png',
        emails: [
          {
            address: 'oswellspencer@umbrella.com',
            isVerified: true,
            isPrimary: true,
          },
        ],
      }),
      createUser(ctx, {
        username: 'gl@d0s',
        password: 'h3r3-w3-g0-@g@1n',
        fullName: 'GLaDOS',
        picture: 'https://www.apperture.com/pictures/glados.png',
        emails: [
          {
            address: 'admin@apperture.com',
            isVerified: true,
            isPrimary: true,
          },
        ],
      }),
    ]);

    org = await createOrg(ctx, {
      name: 'Acme Inc',
      slug: 'acme',
      adminId: user.id,
    });

    unauthorisedUser = await createUser(ctx, {
      username: 'roadrunner',
      password: 'you-c@nt-t0utch-m3',
      fullName: 'Road Beep-Beep Runner',
      picture: 'https://www.acme.com/picture/roadrunner.png',
      emails: [
        {
          address: 'roadrunner@acme.com',
          isVerified: true,
          isPrimary: true,
        },
      ],
    });

    const PermissionModel = ctx.db.model('Permission');
    const requiredPermission = await PermissionModel.findOne({ name: 'yeep.user.write' });
    permissionAssignment = await createPermissionAssignment(ctx, {
      userId: superuser.id,
      orgId: null,
      permissionId: requiredPermission.id,
    });

    session = await createSession(ctx, {
      username: 'wile',
      password: 'catch-the-b1rd$',
    });
    bearerToken = await signBearerJWT(ctx, session);

    superuserSession = await createSession(ctx, {
      username: 'gl@d0s',
      password: 'h3r3-w3-g0-@g@1n',
    });
    superuserBearerToken = await signBearerJWT(ctx, superuserSession);

    unauthorisedSession = await createSession(ctx, {
      username: 'roadrunner',
      password: 'you-c@nt-t0utch-m3',
    });
    unauthorisedBearerToken = await signBearerJWT(ctx, unauthorisedSession);
  });

  afterAll(async () => {
    await destroySession(ctx, session);
    await destroySession(ctx, unauthorisedSession);
    await destroySession(ctx, superuserSession);
    await deletePermissionAssignment(ctx, permissionAssignment);
    await deleteOrg(ctx, org);
    await deleteUser(ctx, user);
    await deleteUser(ctx, existingUser);
    await deleteUser(ctx, unauthorisedUser);
    await deleteUser(ctx, superuser);
    await server.teardown();
  });

  test('returns unauthorized error when requestor does not have sufficient permissions', async () => {
    const res = await request(server)
      .post('/api/user.update')
      .set('Authorization', `Bearer ${unauthorisedBearerToken}`)
      .send({
        id: user.id,
        fullName: 'Not My Full Name',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10012,
        message: `User ${unauthorisedUser.id} is not authorized to perform this action`,
      },
    });
  });

  test('returns error when user does not exist', async () => {
    const res = await request(server)
      .post('/api/user.update')
      .set('Authorization', `Bearer ${superuserBearerToken}`)
      .send({
        id: '5b2d5dd0cd86b77258e16d39', // some random objectid
        fullName: 'Not My Full Name',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10001,
        message: 'User 5b2d5dd0cd86b77258e16d39 not found',
      },
    });
  });

  test('returns error when specified username already exists', async () => {
    const res = await request(server)
      .post('/api/user.update')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        id: user.id,
        username: existingUser.username,
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10006,
        message: `Username "${existingUser.username}" already in use`,
      },
    });
  });

  test('returns error when specified email already exists', async () => {
    // removes isVerified property
    const badEmails = [...user.emails, ...existingUser.emails].map(({ address }) => ({ address }));
    badEmails[0].isPrimary = true;
    const res = await request(server)
      .post('/api/user.update')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        id: user.id,
        emails: badEmails,
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10005,
        message: `Email address already in use`,
      },
    });
  });

  test('returns error when trying to add an org to the user', async () => {
    const res = await request(server)
      .post('/api/user.update')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        id: user.id,
        orgs: ['5b2d5dd0cd86b77258e16d39'], //random id
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

  test('updates user with new image if picture url is provided', async () => {
    const newPictureURL = 'https://www.acme.com/pictures/v2/coyote.png';
    const res = await request(server)
      .post('/api/user.update')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        id: user.id,
        picture: newPictureURL,
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      user: {
        id: user.id,
        picture: newPictureURL,
        fullName: user.fullName,
        username: user.username,
        emails: expect.any(Array),
      },
    });
  });

  test('removes image from user if picture property is null', async () => {
    const res = await request(server)
      .post('/api/user.update')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        id: user.id,
        picture: null,
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      user: {
        id: user.id,
        picture: null,
        fullName: user.fullName,
        username: user.username,
        emails: expect.any(Array),
      },
    });
  });

  describe('requestor is superuser', () => {
    test('returns error when specifying a primary email that is NOT verified', async () => {
      const emails = [
        {
          address: 'not@verified.com',
          isVerified: false,
          isPrimary: false,
        },
      ];
      const res = await request(server)
        .post('/api/user.update')
        .set('Authorization', `Bearer ${superuserBearerToken}`)
        .send({
          id: unauthorisedUser.id,
          emails,
        });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10004,
          message: expect.any(String),
        },
      });
    });

    test('returns valid user when setting emails as verified', async () => {
      const emails = [
        ...unauthorisedUser.emails,
        {
          address: 'not@verified.com',
          isVerified: true,
          isPrimary: false,
        },
      ];
      const res = await request(server)
        .post('/api/user.update')
        .set('Authorization', `Bearer ${superuserBearerToken}`)
        .send({
          id: unauthorisedUser.id,
          emails,
        });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
        user: {
          id: unauthorisedUser.id,
          emails: expect.arrayContaining([
            {
              address: expect.any(String),
              isVerified: true,
              isPrimary: expect.any(Boolean),
            },
          ]),
        },
      });
    });

    test('updates any user and returns expected response', async () => {
      const newPictureURL = 'https://www.acme.com/pictures/v2/coyote.png';
      const res = await request(server)
        .post('/api/user.update')
        .set('Authorization', `Bearer ${superuserBearerToken}`)
        .send({
          id: unauthorisedUser.id,
          fullName: 'new Coyotee',
          username: 'alibaba',
          emails: [
            {
              address: 'roadrunner@acme.com',
              isPrimary: true,
            },
            {
              address: 'roadrunner-new@acme.com',
            },
          ],
          picture: newPictureURL,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
        user: {
          id: unauthorisedUser.id,
          fullName: 'new Coyotee',
          username: 'alibaba',
          emails: expect.arrayContaining([
            {
              address: expect.any(String),
              isVerified: expect.any(Boolean),
              isPrimary: expect.any(Boolean),
            },
          ]),
          picture: newPictureURL,
        },
      });
    });

    test('updates user password without requiring 2FA', async () => {
      const newPassword = 'thi$-$s-$af3r';
      const res = await request(server)
        .post('/api/user.update')
        .set('Authorization', `Bearer ${superuserBearerToken}`)
        .send({
          id: user.id,
          password: newPassword,
        });

      expect(res.status).toBe(200);
      const newSession = await createSession(ctx, {
        username: 'wile',
        password: newPassword,
      });
      // destroying the session before asserting in case of test failing
      await destroySession(ctx, newSession);
      expect(newSession).toMatchObject({
        secret: expect.any(String),
        user: expect.any(Object),
        createdAt: expect.any(Date),
        expiresAt: expect.any(Date),
      });
    });
  });

  describe('requestor updates their own profile', () => {
    test('returns error when setting email as verified', async () => {
      const badEmails = [
        ...user.emails,
        {
          address: 'not@verified.com',
          isVerified: true,
          isPrimary: false,
        },
      ];
      const res = await request(server)
        .post('/api/user.update')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send({
          id: user.id,
          emails: badEmails,
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

    test('returns error when specifying a primary email that has not been verified', async () => {
      const badEmails = [
        {
          address: 'not@verified.com',
          isPrimary: true,
        },
      ];
      const res = await request(server)
        .post('/api/user.update')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send({
          id: user.id,
          emails: badEmails,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10004,
          message: `You need to verify ${badEmails[0].address} before marking it as primary`,
        },
      });
    });

    test('updates user and returns expected response', async () => {
      const newPictureURL = 'https://www.acme.com/pictures/v2/coyote.png';
      const res = await request(server)
        .post('/api/user.update')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send({
          id: user.id,
          fullName: 'new Coyotee',
          username: 'wile2',
          emails: [
            {
              address: 'coyote@acme.com',
              isPrimary: true,
            },
            {
              address: 'coyote-new@acme.com',
            },
          ],
          picture: newPictureURL,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
        user: {
          id: user.id,
          fullName: 'new Coyotee',
          username: 'wile2',
          emails: expect.arrayContaining([
            {
              address: 'coyote@acme.com',
              isVerified: true,
              isPrimary: true,
            },
            {
              address: expect.any(String),
              isVerified: expect.any(Boolean),
              isPrimary: expect.any(Boolean),
            },
          ]),
          picture: newPictureURL,
        },
      });

      // update user obj in context
      user.username = 'wile2';
    });

    test('returns error when updating password without 2FA', async () => {
      const newPassword = 'thi$-$s-$af3r';
      const res = await request(server)
        .post('/api/user.update')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send({
          id: user.id,
          password: newPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10034,
          message: expect.any(String),
          applicableAuthFactorTypes: expect.any(Array),
        },
      });
    });

    test('returns error when 2FA is invalid', async () => {
      const newPassword = 'thi$-$s-$af3r';
      const res = await request(server)
        .post('/api/user.update')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send({
          id: user.id,
          password: newPassword,
          secondaryAuthFactor: {
            type: 'PASSWORD',
            token: 'invalid-password',
          },
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10035,
          message: expect.any(String),
        },
      });
    });

    test('successfully updates user password', async () => {
      const newPassword = 'thi$-$s-$af3r';
      const res = await request(server)
        .post('/api/user.update')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send({
          id: user.id,
          password: newPassword,
          secondaryAuthFactor: {
            type: 'PASSWORD',
            token: 'catch-the-b1rd$',
          },
        });

      expect(res.status).toBe(200);
      const newSession = await createSession(ctx, {
        username: user.username, // this was changed in an earlier test. How can we avoid it best?
        password: newPassword,
      });
      // destroying the session before asserting in case of test failing
      await destroySession(ctx, newSession);
      expect(newSession).toMatchObject({
        secret: expect.any(String),
        user: expect.any(Object),
        createdAt: expect.any(Date),
        expiresAt: expect.any(Date),
      });
    });
  });
});
