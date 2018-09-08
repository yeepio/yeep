/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
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
    await server.setup();
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
    let org;
    let user;
    let permissionAssignment;
    let session;
    let permission;
    let role;

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

      session = await createSessionToken(ctx.db, ctx.jwt, {
        username: 'wile',
        password: 'catch-the-b1rd$',
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
    });

    afterAll(async () => {
      await destroySessionToken(ctx.db, session);
      await deleteRole(ctx.db, role);
      await deletePermissionAssignment(ctx.db, permissionAssignment);
      await deletePermission(ctx.db, permission);
      await deleteUser(ctx.db, user);
      await deleteOrg(ctx.db, org);
    });

    test('returns error when `id` contains invalid characters', async () => {
      const res = await request(server)
        .post('/api/v1/user.revokeRole')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          id: '507f1f77bcf86cd79943901@',
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
      expect(res.body.error.details[0].path).toEqual(['id']);
      expect(res.body.error.details[0].type).toBe('string.hex');
    });

    test('returns error when `id` contains more than 24 characters', async () => {
      const res = await request(server)
        .post('/api/v1/user.revokeRole')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          id: '507f1f77bcf86cd7994390112',
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
      expect(res.body.error.details[0].path).toEqual(['id']);
      expect(res.body.error.details[0].type).toBe('string.length');
    });

    test('returns error when `id` contains less than 24 characters', async () => {
      const res = await request(server)
        .post('/api/v1/user.revokeRole')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          id: '507f1f77bcf86cd79943901',
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
      expect(res.body.error.details[0].path).toEqual(['id']);
      expect(res.body.error.details[0].type).toBe('string.length');
    });

    test('returns error when `id` is unspecified', async () => {
      const res = await request(server)
        .post('/api/v1/user.revokeRole')
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
      expect(res.body.error.details[0].path).toEqual(['id']);
      expect(res.body.error.details[0].type).toBe('any.required');
    });

    test('returns error when payload contains unknown properties', async () => {
      const res = await request(server)
        .post('/api/v1/user.revokeRole')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          id: '507f191e810c19729de860ea',
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

    test('returns error when role assignment does not exist', async () => {
      const res = await request(server)
        .post('/api/v1/user.revokeRole')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          id: '507f191e810c19729de860ea', // some random object id
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10021,
          message: 'RoleAssignment 507f191e810c19729de860ea does not exist',
        },
      });
    });

    test('deletes role assignment and returns expected response', async () => {
      const roleAssignment = await createRoleAssignment(ctx.db, {
        userId: user.id,
        orgId: org.id,
        roleId: role.id,
      });

      const res = await request(server)
        .post('/api/v1/user.revokeRole')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          id: roleAssignment.id,
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
    let session;
    let permission;
    let role;
    let roleAssignment;

    beforeAll(async () => {
      // user "wile" is admin in "acme" org
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

      // user "wazowski" is admin in "monsters" org
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

      // user "wile" is logged in
      session = await createSessionToken(ctx.db, ctx.jwt, {
        username: 'wile',
        password: 'catch-the-b1rd$',
      });

      // create test permission + role
      permission = await createPermission(ctx.db, {
        name: 'acme.code.write',
        description: 'Permission to edit (write, delete, update) source code',
      });
      role = await createRole(ctx.db, {
        name: 'acme:developer',
        description: 'Developer role',
        permissions: [permission.id],
      });

      // assign test permission to user "wazowski"
      roleAssignment = await createRoleAssignment(ctx.db, {
        userId: wazowski.id,
        orgId: monsters.id,
        roleId: role.id,
      });
    });

    afterAll(async () => {
      await destroySessionToken(ctx.db, session);
      await deleteOrg(ctx.db, acme);
      await deleteUser(ctx.db, wile);
      await deleteOrg(ctx.db, monsters);
      await deleteUser(ctx.db, wazowski);
      await deleteRoleAssignment(ctx.db, roleAssignment);
      await deleteRole(ctx.db, role);
      await deletePermission(ctx.db, permission);
    });

    test('returns error when user permission scope does not match the roleAssignment org context', async () => {
      const res = await request(server)
        .post('/api/v1/user.revokeRole')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          id: roleAssignment.id,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10012,
          message: `User "${
            wile.username
          }" does not have permission "yeep.role.assignment.write" to access this resource`,
        },
      });
    });
  });
});
