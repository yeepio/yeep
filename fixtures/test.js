/* eslint-env jest */
import request from 'supertest';
import server from '../server/server';
import config from '../yeep.config';
import createSession from '../server/api/session/create/service';

describe('Test login', () => {
  let ctx;
  let userSession;
  beforeAll(async () => {
    await server.setup(config);
    ctx = server.getAppContext();
    userSession = await createSession(ctx, {
      username: 'Wallace76',
      password: 'APi7KiTkBQmdZO5',
    });
  });

  afterAll(async () => {
    await server.teardown();
  });

  test('should login', async () => {
    expect(userSession).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
  });

  test('returns list of orgs the user has access to', async () => {
    const res = await request(server)
      .post('/api/org.list')
      .set('Authorization', `Bearer ${userSession.accessToken}`)
      .send();

    expect(res.status).toBe(200);
    console.log(res.body);
  });

  test.only('returns list of users the user has access to', async () => {
    const res = await request(server)
      .post('/api/user.list')
      .set('Authorization', `Bearer ${userSession.accessToken}`)
      .send();

    expect(res.status).toBe(200);
    console.log(res.body);
  });
});
  