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
import deletePermissionAssignment from './service';

describe('api/v1/user.revokePermission', () => {
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
        .post('/api/v1/user.revokePermission')
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
    let session;
    let requestedPermission;

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
      const permission = await PermissionModel.findOne({
        name: 'yeep.permission.assignment.write',
      });
      permissionAssignment = await createPermissionAssignment(ctx.db, {
        userId: wile.id,
        orgId: acme.id,
        permissionId: permission.id,
      });

      session = await createSessionToken(ctx.db, ctx.jwt, {
        username: 'wile',
        password: 'catch-the-b1rd$',
      });

      requestedPermission = await createPermission(ctx.db, {
        name: 'acme.permission.test',
        description: 'Test permission',
        scope: acme.id,
      });
    });

    afterAll(async () => {
      await destroySessionToken(ctx.db, session);
      await deletePermissionAssignment(ctx.db, permissionAssignment);
      await deletePermission(ctx.db, requestedPermission);
      await deleteOrg(ctx.db, acme);
      await deleteUser(ctx.db, wile);
    });

    test('returns error when `userId` contains invalid characters', async () => {
      const res = await request(server)
        .post('/api/v1/user.revokePermission')
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
        .post('/api/v1/user.revokePermission')
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
        .post('/api/v1/user.revokePermission')
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
        .post('/api/v1/user.revokePermission')
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
        .post('/api/v1/user.revokePermission')
        .set('Authorization', `Bearer ${session.token}`)
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
        .post('/api/v1/user.revokePermission')
        .set('Authorization', `Bearer ${session.token}`)
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
        .post('/api/v1/user.revokePermission')
        .set('Authorization', `Bearer ${session.token}`)
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

    test('returns error when `permissionId` contains invalid characters', async () => {
      const res = await request(server)
        .post('/api/v1/user.revokePermission')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: wile.id,
          orgId: '507f1f77bcf86cd799439012', // some random object id
          permissionId: '507f1f77bcf86cd79943901@',
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
      expect(res.body.error.details[0].path).toEqual(['permissionId']);
      expect(res.body.error.details[0].type).toBe('string.hex');
    });

    test('returns error when `permissionId` contains more than 24 characters', async () => {
      const res = await request(server)
        .post('/api/v1/user.revokePermission')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: wile.id,
          orgId: '507f1f77bcf86cd799439012', // some random object id
          permissionId: '507f1f77bcf86cd7994390112',
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
      expect(res.body.error.details[0].path).toEqual(['permissionId']);
      expect(res.body.error.details[0].type).toBe('string.length');
    });

    test('returns error when `permissionId` contains less than 24 characters', async () => {
      const res = await request(server)
        .post('/api/v1/user.revokePermission')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: wile.id,
          orgId: '507f1f77bcf86cd799439012', // some random object id
          permissionId: '507f1f77bcf86cd79943901',
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
      expect(res.body.error.details[0].path).toEqual(['permissionId']);
      expect(res.body.error.details[0].type).toBe('string.length');
    });

    test('returns error when `permissionId` is unspecified', async () => {
      const res = await request(server)
        .post('/api/v1/user.revokePermission')
        .set('Authorization', `Bearer ${session.token}`)
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
      expect(res.body.error.details[0].path).toEqual(['permissionId']);
      expect(res.body.error.details[0].type).toBe('any.required');
    });

    test('returns error when payload contains unknown properties', async () => {
      const res = await request(server)
        .post('/api/v1/user.revokePermission')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: wile.id,
          permissionId: requestedPermission.id,
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
        .post('/api/v1/user.revokePermission')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: '507f191e810c19729de860ea', // some random object id
          permissionId: requestedPermission.id,
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

    test('returns error when permission assignment does not exist', async () => {
      const res = await request(server)
        .post('/api/v1/user.revokePermission')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: wile.id,
          permissionId: '507f191e810c19729de860ea', // some random object id
          orgId: acme.id,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10013,
          message: 'PermissionAssignment does not exist',
        },
      });
    });

    test('deletes permission assignment and returns expected response', async () => {
      await createPermissionAssignment(ctx.db, {
        orgId: acme.id,
        userId: wile.id,
        permissionId: requestedPermission.id,
      });

      const res = await request(server)
        .post('/api/v1/user.revokePermission')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          orgId: acme.id,
          userId: wile.id,
          permissionId: requestedPermission.id,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
      });
    });
  });

  describe('user with invalid permission scope', () => {
    let wile;
    let acme;
    let wazowski;
    let monsters;
    let wileSession;
    let requestedPermission;
    let requestedPermissionAssignment;

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

      // create test permission
      requestedPermission = await createPermission(ctx.db, {
        name: 'acme.permission.test',
        description: 'Test permission',
      });

      // assign test permission to user "wazowski"
      requestedPermissionAssignment = await createPermissionAssignment(ctx.db, {
        userId: wazowski.id,
        orgId: monsters.id,
        permissionId: requestedPermission.id,
      });

      // user "wile" is logged in
      wileSession = await createSessionToken(ctx.db, ctx.jwt, {
        username: 'wile',
        password: 'catch-the-b1rd$',
      });
    });

    afterAll(async () => {
      await destroySessionToken(ctx.db, wileSession);
      await deletePermissionAssignment(ctx.db, requestedPermissionAssignment);
      await deletePermission(ctx.db, requestedPermission);
      await deleteOrg(ctx.db, acme);
      await deleteUser(ctx.db, wile);
      await deleteOrg(ctx.db, monsters);
      await deleteUser(ctx.db, wazowski);
    });

    test('returns error when user permission scope does not match the designated permission assignment org', async () => {
      const res = await request(server)
        .post('/api/v1/user.revokePermission')
        .set('Authorization', `Bearer ${wileSession.token}`)
        .send({
          orgId: monsters.id,
          userId: wazowski.id,
          permissionId: requestedPermission.id,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10012,
          message: `User "${
            wile.username
          }" does not have permission "yeep.permission.assignment.write" to access this resource`,
        },
      });
    });
  });
});
