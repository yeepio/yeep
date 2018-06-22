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
