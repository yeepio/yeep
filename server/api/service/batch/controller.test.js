/* eslint-env jest */
import request from 'supertest';
import config from '../../../../yeep.config';
import server from '../../../server';
import createUser from '../../user/create/service';
import createSession from '../../session/create/service';
import destroySession from '../../session/destroy/service';
import deleteUser from '../../user/delete/service';

describe('api/batch', () => {
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
        .post('/api/batch')
        .send();
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
    let wileUser;
    let wileSession;

    beforeAll(async () => {
      wileUser = await createUser(ctx, {
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

      wileSession = await createSession(ctx, {
        username: 'wile',
        password: 'catch-the-b1rd$',
      });
    });

    afterAll(async () => {
      await destroySession(ctx, wileSession);
      await deleteUser(ctx, wileUser);
    });

    test('returns error when `requests` prop is missing', async () => {
      const res = await request(server)
        .post('/api/batch')
        .set('Authorization', `Bearer ${wileSession.accessToken}`)
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
      expect(res.body.error.details[0].path).toEqual(['requests']);
      expect(res.body.error.details[0].type).toBe('any.required');
    });

    test('returns error when `requests` prop is not array', async () => {
      const res = await request(server)
        .post('/api/batch')
        .set('Authorization', `Bearer ${wileSession.accessToken}`)
        .send({
          requests: {},
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
      expect(res.body.error.details[0].path).toEqual(['requests']);
      expect(res.body.error.details[0].type).toBe('array.base');
    });

    test('returns error when `method` is invalid', async () => {
      const res = await request(server)
        .post('/api/batch')
        .set('Authorization', `Bearer ${wileSession.accessToken}`)
        .send({
          requests: [
            {
              method: 'foo',
            },
          ],
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
      expect(res.body.error.details[0].path).toEqual(['requests', 0, 'method']);
      expect(res.body.error.details[0].type).toBe('any.allowOnly');
    });

    test('returns error when `path` is NOT relative', async () => {
      const res = await request(server)
        .post('/api/batch')
        .set('Authorization', `Bearer ${wileSession.accessToken}`)
        .send({
          requests: [
            {
              method: 'POST',
              path: 'https://www.google.com/api/test',
            },
          ],
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
      expect(res.body.error.details[0].path).toEqual(['requests', 0, 'path']);
      expect(res.body.error.details[0].type).toBe('string.uriRelativeOnly');
    });

    test('returns error when `path` references a session API', async () => {
      const res = await request(server)
        .post('/api/batch')
        .set('Authorization', `Bearer ${wileSession.accessToken}`)
        .send({
          requests: [
            {
              method: 'POST',
              path: '/api/session.create',
              body: {
                user: 'wile',
                password: 'catch-the-b1rd$',
              },
            },
          ],
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
      expect(res.body.error.details[0].path).toEqual(['requests', 0, 'path']);
      expect(res.body.error.details[0].type).toBe('string.regex.name');
    });

    test('returns error when `path` references a service API, e.g. another batch operation', async () => {
      const res = await request(server)
        .post('/api/batch')
        .set('Authorization', `Bearer ${wileSession.accessToken}`)
        .send({
          requests: [
            {
              method: 'POST',
              path: '/api/batch',
              body: {
                requests: [],
              },
            },
          ],
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
      expect(res.body.error.details[0].path).toEqual(['requests', 0, 'path']);
      expect(res.body.error.details[0].type).toBe('string.regex.name');
    });

    test('processes requests in batch and returns proper response', async () => {
      const res = await request(server)
        .post('/api/batch')
        .set('Authorization', `Bearer ${wileSession.accessToken}`)
        .send({
          requests: [
            {
              method: 'POST',
              path: '/api/user.info',
              body: {
                id: wileUser.id,
              },
            },
            {
              method: 'POST',
              path: '/api/user.info',
              body: {
                id: wileUser.id,
              },
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
        responses: [
          {
            ok: true,
            ts: expect.any(Number),
            user: expect.objectContaining({
              id: wileUser.id,
            }),
          },
          {
            ok: true,
            ts: expect.any(Number),
            user: expect.objectContaining({
              id: wileUser.id,
            }),
          },
        ],
      });
    });
  });
});
