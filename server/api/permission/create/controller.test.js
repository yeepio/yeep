/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import createPermission from './service';
import deletePermission from '../delete/service';

describe('api/v1/permission.create', () => {
  let ctx;

  beforeAll(async () => {
    await server.setup();
    ctx = server.getAppContext();
  });

  afterAll(async () => {
    await server.teardown();
  });

  test('returns error when permission already exists', async () => {
    const permission = await createPermission(ctx.db, {
      name: 'yeep.permission.test.a',
      description: 'This is a test',
    });

    const res = await request(server)
      .post('/api/v1/permission.create')
      .send({
        name: 'yeep.permission.test.a',
        description: 'This is a tost',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10007,
        message: 'Permission "yeep.permission.test.a" with global scope already exists',
      },
    });

    const isPermissionDeleted = await deletePermission(ctx.db, permission);
    expect(isPermissionDeleted).toBe(true);
  });

  test('returns error when permission + scope already exists', async () => {
    const permission = await createPermission(ctx.db, {
      name: 'yeep.permission.test.b',
      description: 'This is a test',
      scope: ['5b2d646ce248cb779e7f26cc'],
    });

    const res = await request(server)
      .post('/api/v1/permission.create')
      .send({
        name: 'yeep.permission.test.b',
        description: 'This is a tost',
        scope: ['5b2d649ce248cb779e7f26e2', '5b2d646ce248cb779e7f26cc'],
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10007,
        message: 'Permission "yeep.permission.test.b" with specified scope already exists',
      },
    });

    const isPermissionDeleted = await deletePermission(ctx.db, permission);
    expect(isPermissionDeleted).toBe(true);
  });

  test('creates new permission and returns expected response', async () => {
    let res = await request(server)
      .post('/api/v1/permission.create')
      .send({
        name: 'yeep.permission.test.c',
        description: 'This is a test',
        scope: ['5b2d649ce248cb779e7f26e2', '5b2d646ce248cb779e7f26cc'],
      });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      permission: expect.objectContaining({
        id: expect.any(String),
        name: 'yeep.permission.test.c',
        description: 'This is a test',
        scope: ['5b2d649ce248cb779e7f26e2', '5b2d646ce248cb779e7f26cc'],
        isSystemPermission: false,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    });

    const isPermissionDeleted = await deletePermission(ctx.db, {
      id: res.body.permission.id,
    });
    expect(isPermissionDeleted).toBe(true);
  });
});
