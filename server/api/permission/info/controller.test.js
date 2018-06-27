/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import createPermission from '../create/service';
import deletePermission from '../delete/service';

describe('api/v1/permission.info', () => {
  let ctx;

  beforeAll(async () => {
    await server.setup();
    ctx = server.getAppContext();
  });

  afterAll(async () => {
    await server.teardown();
  });

  test('returns error when permission does not exist', async () => {
    const res = await request(server)
      .post('/api/v1/permission.info')
      .send({
        id: '5b2d5dd0cd86b77258e16d39',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10008,
        message: 'Permission 5b2d5dd0cd86b77258e16d39 cannot be found',
      },
    });
  });

  test('retrieves permission info', async () => {
    const permission = await createPermission(ctx.db, {
      name: 'yeep.permission.test',
      description: 'This is a test',
    });

    const res = await request(server)
      .post('/api/v1/permission.info')
      .send({
        id: permission.id,
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      permission: {
        id: permission.id,
      },
    });

    const isPermissionDeleted = await deletePermission(ctx.db, permission);
    expect(isPermissionDeleted).toBe(true);
  });
});
