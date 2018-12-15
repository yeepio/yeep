/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import config from '../../../../yeep.config';
import deleteUser from '../delete/service';
import createUser from '../create/service';
import createPermission from '../../permission/create/service';
import deletePermission from '../../permission/delete/service';
import createOrg from '../../org/create/service';
import deleteOrg from '../../org/delete/service';
import deletePermissionAssignment from '../revokePermission/service';
import createSessionToken from '../../session/create/service';
import destroySessionToken from '../../session/destroy/service';

describe('api/v1/user.assignPermission', () => {
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
        .post('/api/v1/user.assignPermission')
        .send({
          userId: '507f191e810c19729de860ea', // some random object id
          permissionId: '507f191e810c19729de860eb', // some random object id
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
    let acme;
    let wile;
    let permission;
    let session;

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

      permission = await createPermission(ctx.db, {
        name: 'acme.permission.test',
        description: 'Test permission',
        scope: acme.id,
      });

      session = await createSessionToken(ctx.db, ctx.jwt, {
        username: 'wile',
        password: 'catch-the-b1rd$',
      });
    });

    afterAll(async () => {
      await destroySessionToken(ctx.db, session);
      await deleteOrg(ctx.db, acme);
      await deleteUser(ctx.db, wile);
      await deletePermission(ctx.db, permission);
    });

    test('returns error when `userId` contains invalid characters', async () => {
      const res = await request(server)
        .post('/api/v1/user.assignPermission')
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
        .post('/api/v1/user.assignPermission')
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
        .post('/api/v1/user.assignPermission')
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
        .post('/api/v1/user.assignPermission')
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
        .post('/api/v1/user.assignPermission')
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
        .post('/api/v1/user.assignPermission')
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
        .post('/api/v1/user.assignPermission')
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
        .post('/api/v1/user.assignPermission')
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
        .post('/api/v1/user.assignPermission')
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
        .post('/api/v1/user.assignPermission')
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
        .post('/api/v1/user.assignPermission')
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
        .post('/api/v1/user.assignPermission')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: wile.id,
          permissionId: permission.id,
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
        .post('/api/v1/user.assignPermission')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: '507f191e810c19729de860ea', // some random object id
          permissionId: permission.id,
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

    test('returns error when permission does not exist', async () => {
      const res = await request(server)
        .post('/api/v1/user.assignPermission')
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
          code: 10008,
          message: 'Permission does not exist',
        },
      });
    });

    test('creates permission assignment and returns expected response', async () => {
      const res = await request(server)
        .post('/api/v1/user.assignPermission')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: wile.id,
          permissionId: permission.id,
          orgId: acme.id,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
      });

      const isPermissionAssignmentDeleted = await deletePermissionAssignment(
        ctx.db,
        res.body.permissionAssignment
      );
      expect(isPermissionAssignmentDeleted).toBe(true);
    });
  });

  describe('user with invalid permission scope', () => {
    let acme;
    let monsters;
    let wile;
    let permission;
    let session;

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

      monsters = await createOrg(ctx.db, {
        name: 'Monsters Inc',
        slug: 'monsters',
        adminId: wile.id,
      });

      permission = await createPermission(ctx.db, {
        name: 'acme.permission.test',
        description: 'Test permission',
        scope: monsters.id,
      });

      session = await createSessionToken(ctx.db, ctx.jwt, {
        username: 'wile',
        password: 'catch-the-b1rd$',
      });
    });

    afterAll(async () => {
      await destroySessionToken(ctx.db, session);
      await deleteOrg(ctx.db, acme);
      await deleteOrg(ctx.db, monsters);
      await deleteUser(ctx.db, wile);
      await deletePermission(ctx.db, permission);
    });

    test('returns error when permission scope does not match the designated org', async () => {
      const res = await request(server)
        .post('/api/v1/user.assignPermission')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: wile.id,
          permissionId: permission.id,
          orgId: acme.id,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10011,
          message: `Permission ${permission.id} cannot be assigned to the designated org`,
        },
      });
    });

    test('returns error when permission scope is global', async () => {
      const res = await request(server)
        .post('/api/v1/user.assignPermission')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: wile.id,
          permissionId: permission.id,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10012,
          message: `User "wile" does not have sufficient permissions to access this resource`,
        },
      });
    });
  });
});
