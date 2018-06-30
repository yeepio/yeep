/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import deleteUser from '../delete/service';
import createUser from './service';
import deletePermissionAssignment from '../revokePermission/service';
import destroySessionToken from '../../session/destroy/service';
import createSessionToken from '../../session/create/service';
import createPermissionAssignment from '../assignPermission/service';
import createOrg from '../../org/create/service';
import deleteOrg from '../../org/delete/service';

describe('api/v1/user.create', () => {
  let ctx;
  let org;
  let requestor;
  let permissionAssignment;
  let session;

  beforeAll(async () => {
    await server.setup();
    ctx = server.getAppContext();

    org = await createOrg(ctx.db, {
      name: 'Acme Inc',
      slug: 'acme',
    });

    requestor = await createUser(ctx.db, {
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

    const PermissionModel = ctx.db.model('Permission');
    const permission = await PermissionModel.findOne({
      name: 'yeep.user.write',
      scope: { $exists: false },
    });
    permissionAssignment = await createPermissionAssignment(ctx.db, {
      userId: requestor.id,
      orgId: org.id,
      permissionId: permission.id,
    });

    session = await createSessionToken(ctx.db, ctx.jwt, {
      username: 'wile',
      password: 'catch-the-b1rd$',
    });
  });

  afterAll(async () => {
    await destroySessionToken(ctx.db, session);
    await deletePermissionAssignment(ctx.db, permissionAssignment);
    await deleteUser(ctx.db, requestor);
    await deleteOrg(ctx.db, org);
    await server.teardown();
  });

  test('returns error when `emails` contains duplicate addresses', async () => {
    const res = await request(server)
      .post('/api/v1/user.create')
      .set('Authorization', `Bearer ${session.token}`)
      .send({
        username: 'runner',
        password: 'fast+furry-ous',
        fullName: 'Road Runner',
        emails: [
          {
            address: 'beep-beep@acme.com',
            isVerified: false,
            isPrimary: false,
          },
          {
            address: 'beep-beep@acme.com',
            isVerified: false,
            isPrimary: false,
          },
        ],
        orgs: [org.id],
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
    expect(res.body.error.details[0].path).toEqual(['emails', 1]);
    expect(res.body.error.details[0].type).toBe('array.unique');
  });

  test('returns error when primary email is not specified', async () => {
    const res = await request(server)
      .post('/api/v1/user.create')
      .set('Authorization', `Bearer ${session.token}`)
      .send({
        username: 'runner',
        password: 'fast+furry-ous',
        fullName: 'Road Runner',
        emails: [
          {
            address: 'beep-beep@acme.com',
            isVerified: false,
            isPrimary: false,
          },
          {
            address: 'roadrunner@acme.com',
            isVerified: false,
            isPrimary: false,
          },
        ],
        orgs: [org.id],
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10004,
        message: 'You must specify at least 1 primary email',
      },
    });
  });

  test('throws error when multiple primary emails are specified', async () => {
    const res = await request(server)
      .post('/api/v1/user.create')
      .set('Authorization', `Bearer ${session.token}`)
      .send({
        username: 'runner',
        password: 'fast+furry-ous',
        fullName: 'Road Runner',
        emails: [
          {
            address: 'beep-beep@acme.com',
            isVerified: false,
            isPrimary: true,
          },
          {
            address: 'roadrunner@acme.com',
            isVerified: false,
            isPrimary: true,
          },
        ],
        orgs: [org.id],
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

  test('creates new user and returns expected response', async () => {
    const res = await request(server)
      .post('/api/v1/user.create')
      .set('Authorization', `Bearer ${session.token}`)
      .send({
        username: 'runner',
        password: 'fast+furry-ous',
        fullName: 'Road Runner',
        emails: [
          {
            address: 'beep-beep@acme.com',
            isVerified: true,
            isPrimary: true,
          },
        ],
        orgs: [org.id],
      });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      user: expect.objectContaining({
        id: expect.any(String),
        username: 'runner',
        fullName: 'Road Runner',
        picture: null,
        emails: [
          {
            address: 'beep-beep@acme.com',
            isVerified: true,
            isPrimary: true,
          },
        ],
        orgs: expect.arrayContaining([org.id]),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    });

    const isUserDeleted = await deleteUser(ctx.db, res.body.user);
    expect(isUserDeleted).toBe(true);
  });

  test('returns error on duplicate username', async () => {
    const user = await createUser(ctx.db, {
      username: 'runner',
      password: 'fast+furry-ous',
      fullName: 'Road Runner',
      picture: 'https://www.acme.com/pictures/roadrunner.png',
      emails: [
        {
          address: 'beep-beep@acme.com',
          isVerified: true,
          isPrimary: true,
        },
      ],
    });

    const res = await request(server)
      .post('/api/v1/user.create')
      .set('Authorization', `Bearer ${session.token}`)
      .send({
        username: 'runner',
        password: 'fast+furry-ous!!',
        fullName: 'Road Runner Jr.',
        emails: [
          {
            address: 'roadrunnerjr@acme.com',
            isVerified: true,
            isPrimary: true,
          },
        ],
        orgs: [org.id],
      });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10006,
        message: expect.any(String),
      },
    });

    const isUserDeleted = await deleteUser(ctx.db, user);
    expect(isUserDeleted).toBe(true);
  });

  test('returns error on duplicate email address', async () => {
    const user = await createUser(ctx.db, {
      username: 'runner',
      password: 'fast+furry-ous',
      fullName: 'Road Runner',
      picture: 'https://www.acme.com/pictures/roadrunner.png',
      emails: [
        {
          address: 'beep-beep@acme.com',
          isVerified: true,
          isPrimary: true,
        },
        {
          address: 'roadrunner@acme.com',
          isVerified: false,
          isPrimary: false,
        },
      ],
    });

    const res = await request(server)
      .post('/api/v1/user.create')
      .set('Authorization', `Bearer ${session.token}`)
      .send({
        username: 'roadrunner',
        password: 'fast+furry-ous',
        fullName: 'Road Runner',
        emails: [
          {
            address: 'RoadRunner@acme.com', // case-insensitive
            isVerified: true,
            isPrimary: true,
          },
        ],
        orgs: [org.id],
      });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10005,
        message: expect.any(String),
      },
    });

    const isUserDeleted = await deleteUser(ctx.db, user);
    expect(isUserDeleted).toBe(true);
  });

  test('returns error when creating global user without necessary permission', async () => {
    const res = await request(server)
      .post('/api/v1/user.create')
      .set('Authorization', `Bearer ${session.token}`)
      .send({
        // absense of orgs denotes global user
        username: 'roadrunner',
        password: 'fast+furry-ous',
        fullName: 'Road Runner',
        emails: [
          {
            address: 'RoadRunner@acme.com', // case-insensitive
            isVerified: true,
            isPrimary: true,
          },
        ],
      });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10012,
        message: expect.any(String),
      },
    });
  });
});
