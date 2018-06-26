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

describe('api/v1/user.assignPermission', () => {
  let ctx;

  beforeAll(async () => {
    await server.setup();
    ctx = server.getAppContext();

    ctx.org = await createOrg(ctx.db, {
      name: 'Acme Inc',
      slug: 'acme',
    });

    ctx.user = await createUser(ctx.db, {
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

    ctx.permission = await createPermission(ctx.db, {
      name: 'yeep.permission.test',
      description: 'Test permission',
      scope: ctx.org.id,
    });

    ctx.otherOrg = await createOrg(ctx.db, {
      name: 'Speak Riddles Old Man Ltd',
      slug: 'speakriddles',
    });

    // const PermissionModel = ctx.db.model('Permission');
    // const permission = await PermissionModel.findOne({
    //   name: 'yeep.permission.write',
    //   scope: { $exists: false },
    // });
    // ctx.permissionAssignment = await createPermissionAssignment(ctx.db, {
    //   userId: ctx.user.id,
    //   // orgId: ctx.org.id,
    //   permissionId: permission.id,
    // });

    // ctx.session = await createSessionToken(ctx.db, ctx.jwt, {
    //   username: 'wile',
    //   password: 'catch-the-b1rd$',
    // });
  });

  afterAll(async () => {
    // await destroySessionToken(ctx.db, ctx.session);
    // await deletePermissionAssignment(ctx.db, ctx.permissionAssignment);
    await deleteOrg(ctx.db, ctx.org);
    await deleteOrg(ctx.db, ctx.otherOrg);
    await deleteUser(ctx.db, ctx.user);
    await deletePermission(ctx.db, ctx.permission);
    await server.teardown();
  });

  test('returns error when `userId` contains invalid characters', async () => {
    const res = await request(server)
      .post('/api/v1/user.assignPermission')
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
      .send({
        userId: '507f1f77bcf86cd799439011',
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
      .send({
        userId: '507f1f77bcf86cd799439011',
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
      .send({
        userId: '507f1f77bcf86cd799439011',
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
      .send({
        userId: '507f1f77bcf86cd799439011',
        orgId: '507f1f77bcf86cd799439012',
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
      .send({
        userId: '507f1f77bcf86cd799439011',
        orgId: '507f1f77bcf86cd799439012',
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
      .send({
        userId: '507f1f77bcf86cd799439011',
        orgId: '507f1f77bcf86cd799439012',
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
      .send({
        userId: '507f1f77bcf86cd799439011',
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
      .send({
        userId: '507f1f77bcf86cd799439011',
        permissionId: '507f1f77bcf86cd799439013',
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
      .send({
        userId: '507f1f77bcf86cd799439011', // some random objectid
        permissionId: ctx.permission.id,
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
      .send({
        userId: ctx.user.id,
        permissionId: '507f1f77bcf86cd799439013', // some random objectid
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

  test('returns error when permission scope does not match the designated org', async () => {
    const res = await request(server)
      .post('/api/v1/user.assignPermission')
      .send({
        userId: ctx.user.id,
        permissionId: ctx.permission.id,
        orgId: ctx.otherOrg.id,
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10011,
        message: `Permission ${ctx.permission.id} cannot be assigned to the designated org`,
      },
    });
  });

  test('creates permission assignment and returns expected response', async () => {
    const res = await request(server)
      .post('/api/v1/user.assignPermission')
      .send({
        userId: ctx.user.id,
        permissionId: ctx.permission.id,
        orgId: ctx.org.id,
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
