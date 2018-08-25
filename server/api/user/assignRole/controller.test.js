/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import deleteUser from '../delete/service';
import createUser from '../create/service';
import createPermission from '../../permission/create/service';
import deletePermission from '../../permission/delete/service';
import createOrg from '../../org/create/service';
import deleteOrg from '../../org/delete/service';
import deletePermissionAssignment from '../revokePermission/service';
import createPermissionAssignment from '../assignPermission/service';
import createSessionToken from '../../session/create/service';
import destroySessionToken from '../../session/destroy/service';
import createRole from '../../role/create/service';
import deleteRole from '../../role/delete/service';

describe('api/v1/user.assignRole', () => {
  let ctx;

  beforeAll(async () => {
    await server.setup();
    ctx = server.getAppContext();
  });

  afterAll(async () => {
    await server.teardown();
  });

  describe('unauthorized user', () => {
    test('returns error pretending resource does not exist', async () => {
      const res = await request(server)
        .post('/api/v1/user.assignRole')
        .send({
          userId: '507f191e810c19729de860ea', // some random object id
          roleId: '507f191e810c19729de860eb', // some random object id
          orgId: '507f191e810c19729de860ec', // some random object id
        });
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
    let org;
    let user;
    let permission;
    let permissionAssignment;
    let role;
    let session;

    beforeAll(async () => {
      user = await createUser(ctx.db, {
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

      org = await createOrg(ctx.db, {
        name: 'Acme Inc',
        slug: 'acme',
        adminId: user.id,
      });

      const PermissionModel = ctx.db.model('Permission');
      const requiredPermission = await PermissionModel.findOne({
        name: 'yeep.role.assignment.write',
      });
      permissionAssignment = await createPermissionAssignment(ctx.db, {
        userId: user.id,
        orgId: org.id,
        permissionId: requiredPermission.id,
      });

      permission = await createPermission(ctx.db, {
        name: 'acme.code.write',
        description: 'Permission to edit (write, delete, update) source code',
        scope: org.id,
      });

      role = await createRole(ctx.db, {
        name: 'acme:developer',
        description: 'Developer role',
        permissions: [permission.id],
        scope: org.id,
      });

      session = await createSessionToken(ctx.db, ctx.jwt, {
        username: 'wile',
        password: 'catch-the-b1rd$',
      });
    });

    afterAll(async () => {
      await destroySessionToken(ctx.db, session);
      await deletePermissionAssignment(ctx.db, permissionAssignment);
      await deletePermission(ctx.db, permission);
      await deleteRole(ctx.db, role);
      await deleteOrg(ctx.db, org);
      await deleteUser(ctx.db, user);
    });

    test('returns error when `userId` contains invalid characters', async () => {
      const res = await request(server)
        .post('/api/v1/user.assignRole')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: '507f1f77bcf86cd79943901@',
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
      expect(res.body.error.details[0].path).toEqual(['userId']);
      expect(res.body.error.details[0].type).toBe('string.hex');
    });

    test('returns error when `userId` contains more than 24 characters', async () => {
      const res = await request(server)
        .post('/api/v1/user.assignRole')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: '507f1f77bcf86cd7994390112',
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
      expect(res.body.error.details[0].path).toEqual(['userId']);
      expect(res.body.error.details[0].type).toBe('string.length');
    });

    test('returns error when `userId` contains less than 24 characters', async () => {
      const res = await request(server)
        .post('/api/v1/user.assignRole')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: '507f1f77bcf86cd79943901',
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
      expect(res.body.error.details[0].path).toEqual(['userId']);
      expect(res.body.error.details[0].type).toBe('string.length');
    });

    test('returns error when `userId` is unspecified', async () => {
      const res = await request(server)
        .post('/api/v1/user.assignRole')
        .set('Authorization', `Bearer ${session.token}`)
        .send({});
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 400,
          message: 'Invalid request body',
          details: expect.any(Array),
        },
      });
      expect(res.body.error.details[0].path).toEqual(['userId']);
      expect(res.body.error.details[0].type).toBe('any.required');
    });

    test('returns error when `orgId` contains invalid characters', async () => {
      const res = await request(server)
        .post('/api/v1/user.assignRole')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: user.id,
          orgId: '507f1f77bcf86cd79943901@',
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
      expect(res.body.error.details[0].path).toEqual(['orgId']);
      expect(res.body.error.details[0].type).toBe('string.hex');
    });

    test('returns error when `orgId` contains more than 24 characters', async () => {
      const res = await request(server)
        .post('/api/v1/user.assignRole')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: user.id,
          orgId: '507f1f77bcf86cd7994390112',
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
      expect(res.body.error.details[0].path).toEqual(['orgId']);
      expect(res.body.error.details[0].type).toBe('string.length');
    });

    test('returns error when `orgId` contains less than 24 characters', async () => {
      const res = await request(server)
        .post('/api/v1/user.assignRole')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: user.id,
          orgId: '507f1f77bcf86cd79943901',
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
      expect(res.body.error.details[0].path).toEqual(['orgId']);
      expect(res.body.error.details[0].type).toBe('string.length');
    });

    test('returns error when `roleId` contains invalid characters', async () => {
      const res = await request(server)
        .post('/api/v1/user.assignRole')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: user.id,
          orgId: '507f1f77bcf86cd799439012', // some random object id
          roleId: '507f1f77bcf86cd79943901@',
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
      expect(res.body.error.details[0].path).toEqual(['roleId']);
      expect(res.body.error.details[0].type).toBe('string.hex');
    });

    test('returns error when `roleId` contains more than 24 characters', async () => {
      const res = await request(server)
        .post('/api/v1/user.assignRole')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: user.id,
          orgId: '507f1f77bcf86cd799439012', // some random object id
          roleId: '507f1f77bcf86cd7994390112',
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
      expect(res.body.error.details[0].path).toEqual(['roleId']);
      expect(res.body.error.details[0].type).toBe('string.length');
    });

    test('returns error when `roleId` contains less than 24 characters', async () => {
      const res = await request(server)
        .post('/api/v1/user.assignRole')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: user.id,
          orgId: '507f1f77bcf86cd799439012', // some random object id
          roleId: '507f1f77bcf86cd79943901',
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
      expect(res.body.error.details[0].path).toEqual(['roleId']);
      expect(res.body.error.details[0].type).toBe('string.length');
    });

    test('returns error when `roleId` is unspecified', async () => {
      const res = await request(server)
        .post('/api/v1/user.assignRole')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: user.id,
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
      expect(res.body.error.details[0].path).toEqual(['roleId']);
      expect(res.body.error.details[0].type).toBe('any.required');
    });

    test('returns error when payload contains unknown properties', async () => {
      const res = await request(server)
        .post('/api/v1/user.assignRole')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: user.id,
          roleId: role.id,
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

    test('returns error when user does not exist', async () => {
      const res = await request(server)
        .post('/api/v1/user.assignRole')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: '507f191e810c19729de860ea', // some random object id
          roleId: role.id,
          orgId: org.id,
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

    test('returns error when role does not exist', async () => {
      const res = await request(server)
        .post('/api/v1/user.assignRole')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: user.id,
          roleId: '507f191e810c19729de860ea', // some random object id
          orgId: org.id,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10017,
          message: 'Role 507f191e810c19729de860ea does not exist',
        },
      });
    });

    // test('creates role assignment and returns expected response', async () => {
    //   const res = await request(server)
    //     .post('/api/v1/user.assignRole')
    //     .set('Authorization', `Bearer ${session.token}`)
    //     .send({
    //       userId: user.id,
    //       roleId: role.id,
    //       orgId: org.id,
    //     });

    //   expect(res.status).toBe(200);
    //   expect(res.body).toMatchObject({
    //     ok: true,
    //     roleAssignment: {
    //       id: expect.any(String),
    //     },
    //   });

    //   const isRoleAssignmentDeleted = await deletePermissionAssignment(
    //     ctx.db,
    //     res.body.roleAssignment
    //   );
    //   expect(isRoleAssignmentDeleted).toBe(true);
    // });
  });

  describe('user with invalid permission scope', () => {
    let org;
    let otherOrg;
    let user;
    let permission;
    let permissionAssignment;
    let role;
    let session;

    beforeAll(async () => {
      user = await createUser(ctx.db, {
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

      org = await createOrg(ctx.db, {
        name: 'Acme Inc',
        slug: 'acme',
        adminId: user.id,
      });

      otherOrg = await createOrg(ctx.db, {
        name: 'Monsters Inc',
        slug: 'monsters',
        adminId: user.id,
      });

      permission = await createPermission(ctx.db, {
        name: 'acme.code.write',
        description: 'Permission to edit (write, delete, update) source code',
        scope: otherOrg.id,
      });

      role = await createRole(ctx.db, {
        name: 'acme:developer',
        description: 'Developer role',
        permissions: [permission.id],
        scope: otherOrg.id, // note that the role belongs to the "other" org
      });

      const PermissionModel = ctx.db.model('Permission');
      const requiredpermission = await PermissionModel.findOne({
        name: 'yeep.role.assignment.write',
      });
      permissionAssignment = await createPermissionAssignment(ctx.db, {
        userId: user.id,
        permissionId: requiredpermission.id,
      });

      session = await createSessionToken(ctx.db, ctx.jwt, {
        username: 'wile',
        password: 'catch-the-b1rd$',
      });
    });

    afterAll(async () => {
      await destroySessionToken(ctx.db, session);
      await deletePermissionAssignment(ctx.db, permissionAssignment);
      await deleteRole(ctx.db, role);
      await deletePermission(ctx.db, permission);
      await deleteUser(ctx.db, user);
      await deleteOrg(ctx.db, org);
      await deleteOrg(ctx.db, otherOrg);
    });

    test('returns error when role scope does not match the designated org', async () => {
      const res = await request(server)
        .post('/api/v1/user.assignRole')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: user.id,
          roleId: role.id,
          orgId: org.id,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10019,
          message: `Role ${role.id} cannot be assigned to the designated org`,
        },
      });
    });

    test('returns error when org is null', async () => {
      const res = await request(server)
        .post('/api/v1/user.assignRole')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: user.id,
          roleId: role.id,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10019,
          message: `Role ${role.id} cannot be assigned to the designated org`,
        },
      });
    });
  });
});