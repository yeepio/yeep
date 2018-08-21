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
    let org;
    let user;
    let permissionAssignment;
    let session;
    let requestedPermission;
    let requestedPermissionAssignment;

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
      const permission = await PermissionModel.findOne({
        name: 'yeep.permission.assignment.write',
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

      requestedPermission = await createPermission(ctx.db, {
        name: 'acme.permission.test',
        description: 'Test permission',
        scope: org.id,
      });
      requestedPermissionAssignment = await createPermissionAssignment(ctx.db, {
        userId: user.id,
        orgId: org.id,
        permissionId: requestedPermission.id,
      });
    });

    afterAll(async () => {
      await destroySessionToken(ctx.db, session);
      await deletePermissionAssignment(ctx.db, permissionAssignment);
      await deleteOrg(ctx.db, org);
      await deleteUser(ctx.db, user);
      await deletePermissionAssignment(ctx.db, requestedPermissionAssignment);
      await deletePermission(ctx.db, requestedPermission);
    });

    test('returns error when `id` contains invalid characters', async () => {
      const res = await request(server)
        .post('/api/v1/user.revokePermission')
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
        .post('/api/v1/user.revokePermission')
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
        .post('/api/v1/user.revokePermission')
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
      expect(res.body.error.details[0].path).toEqual(['id']);
      expect(res.body.error.details[0].type).toBe('any.required');
    });

    test('returns error when payload contains unknown properties', async () => {
      const res = await request(server)
        .post('/api/v1/user.revokePermission')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          id: requestedPermissionAssignment.id,
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

    test('returns error when permission assignment does not exist', async () => {
      const res = await request(server)
        .post('/api/v1/user.revokePermission')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          id: '507f191e810c19729de860ea', // some random object id
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
      const res = await request(server)
        .post('/api/v1/user.revokePermission')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          id: requestedPermissionAssignment.id,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
      });
    });
  });

  describe('user with invalid permission scope', () => {
    let org;
    let otherOrg;
    let user;
    let permissionAssignment;
    let session;
    let requestedPermission;
    let requestedPermissionAssignment;

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

      const PermissionModel = ctx.db.model('Permission');
      const permission = await PermissionModel.findOne({
        name: 'yeep.permission.assignment.write',
      });
      permissionAssignment = await createPermissionAssignment(ctx.db, {
        userId: user.id,
        permissionId: permission.id,
        orgId: otherOrg.id,
      });

      session = await createSessionToken(ctx.db, ctx.jwt, {
        username: 'wile',
        password: 'catch-the-b1rd$',
      });

      requestedPermission = await createPermission(ctx.db, {
        name: 'acme.permission.test',
        description: 'Test permission',
      });
      requestedPermissionAssignment = await createPermissionAssignment(ctx.db, {
        userId: user.id,
        orgId: org.id,
        permissionId: requestedPermission.id,
      });
    });

    afterAll(async () => {
      await destroySessionToken(ctx.db, session);
      await deletePermissionAssignment(ctx.db, permissionAssignment);
      await deleteOrg(ctx.db, org);
      await deleteOrg(ctx.db, otherOrg);
      await deleteUser(ctx.db, user);
      await deletePermissionAssignment(ctx.db, requestedPermissionAssignment);
      await deletePermission(ctx.db, requestedPermission);
    });

    test('returns error when user permission scope does not match the designated permission assignment org', async () => {
      const res = await request(server)
        .post('/api/v1/user.revokePermission')
        .set('Authorization', `Bearer ${session.token}`)
        .send({
          id: requestedPermissionAssignment.id,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10012,
          message: `User "${
            user.username
          }" does not have permission "yeep.permission.assignment.write" to access this resource`,
        },
      });
    });
  });
});
