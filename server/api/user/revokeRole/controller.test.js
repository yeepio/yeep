/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import config from '../../../../yeep.config';
import createPermissionAssignment from '../assignPermission/service';
import deleteUser from '../delete/service';
import deletePermission from '../../permission/delete/service';
import deleteOrg from '../../org/delete/service';
import createPermission from '../../permission/create/service';
import createOrg from '../../org/create/service';
import createUser from '../create/service';
import createSessionToken from '../../session/create/service';
import destroySessionToken from '../../session/destroy/service';
import deletePermissionAssignment from '../revokePermission/service';
import createRole from '../../role/create/service';
import createRoleAssignment from '../assignRole/service';
import deleteRole from '../../role/delete/service';
import deleteRoleAssignment from './service';

describe('api/v1/user.revokeRole', () => {
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
        .post('/api/v1/user.revokeRole')
        .send({
          id: '507f191e810c19729de860ea', // some random object id
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
    let acme;
    let wile;
    let permissionAssignment;
    let wileSession;
    let permission;
    let role;

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

      acme = await createOrg(ctx.db, {
        name: 'Acme Inc',
        slug: 'acme',
        adminId: wile.id,
      });

      const PermissionModel = ctx.db.model('Permission');
      const requiredPermission = await PermissionModel.findOne({
        name: 'yeep.role.assignment.write',
      });
      permissionAssignment = await createPermissionAssignment(ctx.db, {
        userId: wile.id,
        orgId: acme.id,
        permissionId: requiredPermission.id,
      });

      wileSession = await createSessionToken(ctx, {
        username: 'wile',
        password: 'catch-the-b1rd$',
      });

      permission = await createPermission(ctx.db, {
        name: 'acme.code.write',
        description: 'Permission to edit (write, delete, update) source code',
        scope: acme.id,
      });

      role = await createRole(ctx.db, {
        name: 'acme:developer',
        description: 'Developer role',
        permissions: [permission.id],
        scope: acme.id,
      });
    });

    afterAll(async () => {
      await destroySessionToken(ctx.db, wileSession);
      await deleteRole(ctx.db, role);
      await deletePermissionAssignment(ctx.db, permissionAssignment);
      await deletePermission(ctx.db, permission);
      await deleteUser(ctx.db, wile);
      await deleteOrg(ctx.db, acme);
    });

    test('returns error when `userId` contains invalid characters', async () => {
      const res = await request(server)
        .post('/api/v1/user.revokeRole')
        .set('Authorization', `Bearer ${wileSession.token}`)
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
        .post('/api/v1/user.revokeRole')
        .set('Authorization', `Bearer ${wileSession.token}`)
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
        .post('/api/v1/user.revokeRole')
        .set('Authorization', `Bearer ${wileSession.token}`)
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
        .post('/api/v1/user.revokeRole')
        .set('Authorization', `Bearer ${wileSession.token}`)
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
        .post('/api/v1/user.revokeRole')
        .set('Authorization', `Bearer ${wileSession.token}`)
        .send({
          userId: wile.id,
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
        .post('/api/v1/user.revokeRole')
        .set('Authorization', `Bearer ${wileSession.token}`)
        .send({
          userId: wile.id,
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
        .post('/api/v1/user.revokeRole')
        .set('Authorization', `Bearer ${wileSession.token}`)
        .send({
          userId: wile.id,
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
        .post('/api/v1/user.revokeRole')
        .set('Authorization', `Bearer ${wileSession.token}`)
        .send({
          userId: wile.id,
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
        .post('/api/v1/user.revokeRole')
        .set('Authorization', `Bearer ${wileSession.token}`)
        .send({
          userId: wile.id,
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
        .post('/api/v1/user.revokeRole')
        .set('Authorization', `Bearer ${wileSession.token}`)
        .send({
          userId: wile.id,
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
        .post('/api/v1/user.revokeRole')
        .set('Authorization', `Bearer ${wileSession.token}`)
        .send({
          userId: wile.id,
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
        .post('/api/v1/user.revokeRole')
        .set('Authorization', `Bearer ${wileSession.token}`)
        .send({
          userId: wile.id,
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
        .post('/api/v1/user.revokeRole')
        .set('Authorization', `Bearer ${wileSession.token}`)
        .send({
          userId: '507f191e810c19729de860ea', // some random object id
          roleId: role.id,
          orgId: acme.id,
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
        .post('/api/v1/user.revokeRole')
        .set('Authorization', `Bearer ${wileSession.token}`)
        .send({
          userId: wile.id,
          roleId: '507f191e810c19729de860ea', // some random object id
          orgId: acme.id,
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

    test('deletes role assignment and returns expected response', async () => {
      await createRoleAssignment(ctx.db, {
        userId: wile.id,
        orgId: acme.id,
        roleId: role.id,
      });

      const res = await request(server)
        .post('/api/v1/user.revokeRole')
        .set('Authorization', `Bearer ${wileSession.token}`)
        .send({
          userId: wile.id,
          orgId: acme.id,
          roleId: role.id,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
      });
    });
  });

  describe('user with invalid permission scope', () => {
    let acme;
    let monsters;
    let wile;
    let wazowski;
    let wileSession;
    let permission;
    let role;
    let roleAssignment;

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

      acme = await createOrg(ctx.db, {
        name: 'Acme Inc',
        slug: 'acme',
        adminId: wile.id,
      });

      wazowski = await createUser(ctx.db, {
        username: 'wazowski',
        password: 'grrrrrrrrrrr',
        fullName: 'Mike Wazowski',
        picture: 'https://www.monstersinc.com/pictures/wazowski.png',
        emails: [
          {
            address: 'wazowski@monstersinc.com',
            isVerified: true,
            isPrimary: true,
          },
        ],
      });

      monsters = await createOrg(ctx.db, {
        name: 'Monsters Inc',
        slug: 'monsters',
        adminId: wazowski.id,
      });

      wileSession = await createSessionToken(ctx, {
        username: 'wile',
        password: 'catch-the-b1rd$',
      });

      permission = await createPermission(ctx.db, {
        name: 'acme.code.write',
        description: 'Permission to edit (write, delete, update) source code',
      });

      role = await createRole(ctx.db, {
        name: 'acme:developer',
        description: 'Developer role',
        permissions: [permission.id],
      });

      roleAssignment = await createRoleAssignment(ctx.db, {
        userId: wazowski.id,
        orgId: monsters.id,
        roleId: role.id,
      });
    });

    afterAll(async () => {
      await destroySessionToken(ctx.db, wileSession);
      await deleteRoleAssignment(ctx.db, roleAssignment);
      await deleteRole(ctx.db, role);
      await deletePermission(ctx.db, permission);
      await deleteOrg(ctx.db, acme);
      await deleteUser(ctx.db, wile);
      await deleteOrg(ctx.db, monsters);
      await deleteUser(ctx.db, wazowski);
    });

    test('returns error when user permission scope does not match the roleAssignment org context', async () => {
      const res = await request(server)
        .post('/api/v1/user.revokeRole')
        .set('Authorization', `Bearer ${wileSession.token}`)
        .send({
          userId: wazowski.id,
          orgId: monsters.id,
          roleId: role.id,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10012,
          message: `User "${
            wile.username
          }" does not have sufficient permissions to access this resource`,
        },
      });
    });
  });
});
