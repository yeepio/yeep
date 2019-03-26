/* eslint-env jest */
import request from 'supertest';
import compareDesc from 'date-fns/compare_desc';
import server from '../../../server';
import config from '../../../../yeep.config';
import createOrg from '../../org/create/service';
import createUser from '../create/service';
import createPermissionAssignment from '../assignPermission/service';
import createSession from '../../session/create/service';
import updateUser from '../update/service';
import destroySession from '../../session/destroy/service';
import deletePermissionAssignment from '../revokePermission/service';
import deleteOrg from '../../org/delete/service';
import deleteUser from '../delete/service';

describe('api/user.update', () => {
  let ctx;
  let user;
  let existingUser;
  let org;
  let permissionAssignment;
  let session;

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
  });

  afterAll(async () => {
    await destroySession(ctx, session);
    await deletePermissionAssignment(ctx, permissionAssignment);
    await deleteOrg(ctx, org);
    await deleteUser(ctx, user);
    await deleteUser(ctx, existingUser);
    await server.teardown();
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
    const res = await request(server)
      .post('/api/user.update')
      .set('Authorization', `Bearer ${session.accessToken}`)
      .send({
        id: user.id,
        emails: [existingUser.emails[0]],
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

  // xtest('updates role and returns expected response', async () => {
  //   const role = await createRole(ctx, {
  //     name: 'acme:manager',
  //     description: 'This is a test',
  //     permissions: [permission.id],
  //     scope: org.id,
  //   });

  //   const res = await request(server)
  //     .post('/api/role.update')
  //     .set('Authorization', `Bearer ${session.accessToken}`)
  //     .send({
  //       id: role.id,
  //       name: 'acme:developer',
  //       description: 'This is a tost',
  //       permissions: [permission.id],
  //     });

  //   expect(res.status).toBe(200);
  //   expect(res.body).toMatchObject({
  //     ok: true,
  //     role: {
  //       id: role.id,
  //       name: 'acme:developer',
  //       description: 'This is a tost',
  //       scope: role.scope,
  //       permissions: [permission.id],
  //       isSystemRole: role.isSystemRole,
  //     },
  //   });
  //   expect(compareDesc(role.createdAt, res.body.role.createdAt)).toBe(0);
  //   expect(compareDesc(role.updatedAt, res.body.role.updatedAt)).toBe(1);

  //   const isRoleDeleted = await deleteRole(ctx, {
  //     id: role.id,
  //   });
  //   expect(isRoleDeleted).toBe(true);
  // });

  // xtest('returns error when role is out of scope', async () => {
  //   const globalPermission = await ctx.db.model('Permission').findOne({ name: 'yeep.role.write' });
  //   const role = await createRole(ctx, {
  //     // note the absence of scope to denote global permission
  //     name: 'developer',
  //     description: 'This is a test',
  //     permissions: [globalPermission.id],
  //   });

  //   const res = await request(server)
  //     .post('/api/role.update')
  //     .set('Authorization', `Bearer ${session.accessToken}`)
  //     .send({
  //       id: role.id,
  //       name: 'dev',
  //     });

  //   expect(res.status).toBe(200);
  //   expect(res.body).toMatchObject({
  //     ok: false,
  //     error: {
  //       code: 10012,
  //       message: `User ${user.id} does not have sufficient permissions to access this resource`,
  //     },
  //   });

  //   const isRoleDeleted = await deleteRole(ctx, {
  //     id: role.id,
  //   });
  //   expect(isRoleDeleted).toBe(true);
  // });
});
