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
import createPermissionAssignment from './service';
import createSessionToken from '../../session/create/service';
import destroySessionToken from '../../session/destroy/service';

describe('api/v1/user.assignPermission', () => {
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
    let org;
    let user;
    let requestedPermission;
    let permissionAssignment;
    let session;

    beforeAll(async () => {
      org = await createOrg(ctx.db, {
        name: 'Acme Inc',
        slug: 'acme',
      });

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
        orgs: [org.id],
      });

      requestedPermission = await createPermission(ctx.db, {
        name: 'acme.permission.test',
        description: 'Test permission',
        scope: org.id,
      });

      const PermissionModel = ctx.db.model('Permission');
      const permission = await PermissionModel.findOne({
        name: 'yeep.permission.assignment.write',
        scope: { $exists: false },
      });
      permissionAssignment = await createPermissionAssignment(ctx.db, {
        userId: user.id,
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
      await deleteOrg(ctx.db, org);
      await deleteUser(ctx.db, user);
      await deletePermission(ctx.db, requestedPermission);
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
        .post('/api/v1/user.assignPermission')
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
        .post('/api/v1/user.assignPermission')
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

    test('returns error when `permissionId` contains invalid characters', async () => {
      const res = await request(server)
        .post('/api/v1/user.assignPermission')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: user.id,
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
          userId: user.id,
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
          userId: user.id,
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
      expect(res.body.error.details[0].path).toEqual(['permissionId']);
      expect(res.body.error.details[0].type).toBe('any.required');
    });

    test('returns error when payload contains unknown properties', async () => {
      const res = await request(server)
        .post('/api/v1/user.assignPermission')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: user.id,
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
        .post('/api/v1/user.assignPermission')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: '507f191e810c19729de860ea', // some random object id
          permissionId: requestedPermission.id,
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

    test('returns error when permission does not exist', async () => {
      const res = await request(server)
        .post('/api/v1/user.assignPermission')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: user.id,
          permissionId: '507f191e810c19729de860ea', // some random object id
          orgId: org.id,
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
          userId: user.id,
          permissionId: requestedPermission.id,
          orgId: org.id,
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
    let org;
    let otherOrg;
    let user;
    let requestedPermission;
    let permissionAssignment;
    let session;

    beforeAll(async () => {
      org = await createOrg(ctx.db, {
        name: 'Acme Inc',
        slug: 'acme',
      });

      otherOrg = await createOrg(ctx.db, {
        name: 'Monsters Inc',
        slug: 'monsters',
      });

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
        orgs: [org.id],
      });

      requestedPermission = await createPermission(ctx.db, {
        name: 'acme.permission.test',
        description: 'Test permission',
        scope: otherOrg.id,
      });

      const PermissionModel = ctx.db.model('Permission');
      const permission = await PermissionModel.findOne({
        name: 'yeep.permission.assignment.write',
        scope: { $exists: false },
      });
      permissionAssignment = await createPermissionAssignment(ctx.db, {
        userId: user.id,
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
      await deleteOrg(ctx.db, org);
      await deleteOrg(ctx.db, otherOrg);
      await deleteUser(ctx.db, user);
      await deletePermission(ctx.db, requestedPermission);
    });

    test('returns error when permission scope does not match the designated org', async () => {
      const res = await request(server)
        .post('/api/v1/user.assignPermission')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: user.id,
          permissionId: requestedPermission.id,
          orgId: org.id,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10011,
          message: `Permission ${requestedPermission.id} cannot be assigned to the designated org`,
        },
      });
    });

    test('returns error when permission scope is global', async () => {
      const res = await request(server)
        .post('/api/v1/user.assignPermission')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          userId: user.id,
          permissionId: requestedPermission.id,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10011,
          message: `Permission ${requestedPermission.id} cannot be assigned to the designated org`,
        },
      });
    });
  });
});
