/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';

describe('api/v1/session.info', () => {
  beforeAll(async () => {
    await server.setup();
  });

  afterAll(async () => {
    await server.teardown();
  });

  test('returns session info as expected', async () => {
    let res = await request(server)
      .post('/api/v1/user.create')
      .send({
        username: 'Wile',
        password: 'catch-the-b1rd$',
        fullName: 'Wile E. Coyote',
        emails: [
          {
            address: 'coyote@acme.com',
            isVerified: true,
            isPrimary: true,
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
    });

    const { id: userId } = res.body.user;

    res = await request(server)
      .post('/api/v1/session.create')
      .send({
        username: 'Wile',
        password: 'catch-the-b1rd$',
      });
    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        ok: true,
      })
    );

    const { token } = res.body;

    res = await request(server)
      .post('/api/v1/session.info')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        ok: true,
      })
    );

    res = await request(server)
      .post('/api/v1/user.delete')
      .send({ id: userId });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
    });
  });
});
