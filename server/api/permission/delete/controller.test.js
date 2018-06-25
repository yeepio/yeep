/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import createPermission from '../create/service';

describe('api/v1/permission.delete', () => {
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
      .post('/api/v1/permission.delete')
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

  test('returns error when permission is system-defined', async () => {
    const permission = await ctx.db.model('Permission').findOne({ isSystemPermission: true });

    const res = await request(server)
      .post('/api/v1/permission.delete')
      .send({
        id: permission.id,
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10009,
        message: `Permission ${permission.id} is a system permission and thus cannot be deleted`,
      },
    });
  });

  test('deletes permission and returns expected response', async () => {
    const permission = await createPermission(ctx.db, {
      name: 'yeep.permission.test.a',
      description: 'This is a test',
    });

    let res = await request(server)
      .post('/api/v1/permission.delete')
      .send({
        id: permission.id,
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
    });
  });
});
