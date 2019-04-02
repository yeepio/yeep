/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import config from '../../../../yeep.config';
import createOrg from '../../org/create/service';
import createUser from '../create/service';
import createPermissionAssignment from '../assignPermission/service';
import createSession from '../../session/create/service';
import destroySession from '../../session/destroy/service';
import deletePermissionAssignment from '../revokePermission/service';
import deleteOrg from '../../org/delete/service';
import deleteUser from '../delete/service';

describe('api/user.update', () => {
  let ctx;
  let user;
  let existingUser;
  let unauthorisedUser;
  let org;
  let permissionAssignment;
  let session;
  let unauthorisedSession;

  beforeAll(async () => {
    await server.setup(config);
    ctx = server.getAppContext();

    [user, existingUser] = await Promise.all([
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
    ])

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
      emails: [{
        address: 'roadrunner@acme.com',
        isVerified: true,
        isPrimary: true,
      }],
    })

    const PermissionModel = ctx.db.model('Permission');
    const requiredPermission = await PermissionModel.findOne({ name: 'yeep.user.write' });
    permissionAssignment = await createPermissionAssignment(ctx, {
      userId: user.id,
      orgId: null,
      permissionId: requiredPermission.id,
    });

    session = await createSession(ctx, {
      username: 'wile',
      password: 'catch-the-b1rd$',
    });

    unauthorisedSession = await createSession(ctx, {
      username: 'roadrunner',
      password: 'you-c@nt-t0utch-m3',
    });
  });

  afterAll(async () => {
    await destroySession(ctx, session);
    await destroySession(ctx, unauthorisedSession);
    await deletePermissionAssignment(ctx, permissionAssignment);
    await deleteOrg(ctx, org);
    await deleteUser(ctx, user);
    await deleteUser(ctx, existingUser);
    await deleteUser(ctx, unauthorisedUser);
    await server.teardown();
  });

  test('returns unathorised error when requestor does not have suffiecient permissions', async () => {
    const res = await request(server)
      .post('/api/user.update')
      .set('Authorization', `Bearer ${unauthorisedSession.accessToken}`)
      .send({
        id: user.id,
        fullName: 'Not My Full Name',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10012,
        message: `User ${unauthorisedUser.id} does not have sufficient permissions to access this resource`,
      },
    });
  });

  test('returns error when user does not exist', async () => {
    const res = await request(server)
      .post('/api/user.update')
      .set('Authorization', `Bearer ${session.accessToken}`)
      .send({
        id: '5b2d5dd0cd86b77258e16d39', // some random objectid
        fullName: 'Not My Full Name',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10001,
        message: 'User does not exist',
      },
    });
  });

  test('returns error when specified username already exists', async () => {
    const res = await request(server)
      .post('/api/user.update')
      .set('Authorization', `Bearer ${session.accessToken}`)
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

  test('returns error when specified email already exist', async () => {
    // removes isVerified property
    const badEmails = [...user.emails, ...existingUser.emails].map(({ address }) => (
      { address})
    );
    badEmails[0].isPrimary = true;
    const res = await request(server)
      .post('/api/user.update')
      .set('Authorization', `Bearer ${session.accessToken}`)
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

  test('returns error when providing isVerified values with the emails', async () => {
    const badEmails = [...user.emails, {
      address: 'not@verified.com',
      isVerified: true,
      isPrimary: false,
    }];
    const res = await request(server)
      .post('/api/user.update')
      .set('Authorization', `Bearer ${session.accessToken}`)
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
  test('returns error when specifying a primary email that is not verified', async () => {
    const badEmails = [{
      address: 'not@verified.com',
      isPrimary: true,
    }];
    const res = await request(server)
      .post('/api/user.update')
      .set('Authorization', `Bearer ${session.accessToken}`)
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

  test('returns error when trying to add an org to the user', async () => {
    const res = await request(server)
      .post('/api/user.update')
      .set('Authorization', `Bearer ${session.accessToken}`)
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
      .set('Authorization', `Bearer ${session.accessToken}`)
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
        orgs: expect.any(Array),
      },
    });
  });
  test('removes image from user if picture property is null', async () => {
    const res = await request(server)
      .post('/api/user.update')
      .set('Authorization', `Bearer ${session.accessToken}`)
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
        orgs: expect.any(Array),
      },
    });
  });

  test('updates user and returns expected response', async () => {
    const newPictureURL = 'https://www.acme.com/pictures/v2/coyote.png';
    const res = await request(server)
      .post('/api/user.update')
      .set('Authorization', `Bearer ${session.accessToken}`)
      .send({
        id: user.id,
        fullName: 'new Coyotee',
        username: 'alibaba',
        emails: [{
          address: 'coyote@acme.com',
          isPrimary: true,
        }, {
          address: 'coyote-new@acme.com',
        }],
        picture: newPictureURL,
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      user: {
        id: user.id,
        fullName: 'new Coyotee',
        username: 'alibaba',
        emails: expect.arrayContaining([{
          address: expect.any(String),
          isPrimary: expect.any(Boolean),
        }]),
        picture: newPictureURL,
      },
    });
  });

  test.only('updates user password', async () => {
    const newPassword = 'thi$-$s-$af3r';
    const res = await request(server)
      .post('/api/user.update')
      .set('Authorization', `Bearer ${session.accessToken}`)
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
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
  });
});
