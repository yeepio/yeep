/* eslint-env jest */
import request from 'supertest';
import noop from 'lodash/noop';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import config from '../../../../yeep.config';
import server from '../../../server';
import createUser from '../../user/create/service';
import createSession from '../../session/create/service';
import destroySession from '../../session/destroy/service';
import deleteUser from '../../user/delete/service';

const mock = new MockAdapter(axios);

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

    test('handles network error', async () => {
      const roleResponse = {
        ok: true,
        role: {
          id: '507f191e810c19729de860ea',
          name: 'acme:manager',
          description: 'Manager role',
          permissions: ['327f191e810c19729de76232'],
          scope: '5b2d649ce248cb779e7f26e2',
          isSystemRole: false,
          createdAt: '2017-07-13T05:00:42.145Z',
          updatedAt: '2017-07-13T05:42:42.222Z',
        },
      };
      mock.onPost('/api/user.info').networkErrorOnce();
      mock.onPost('/api/role.info').reply(200, roleResponse);

      const res = await request(server)
        .post('/api/batch')
        .set('Authorization', `Bearer ${wileSession.accessToken}`)
        .send({
          requests: [
            {
              method: 'POST',
              path: '/api/user.info',
              body: {
                id: '507f191e810c19729de860ea',
              },
            },
            {
              method: 'POST',
              path: '/api/role.info',
              body: {
                id: '507f191e810c19729de860fa',
              },
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
        responses: [
          {
            ok: false,
            error: { code: 502, message: 'Network Error' },
            ts: expect.any(Number),
          },
          roleResponse,
        ],
      });
    });

    test('handles timout errors', async () => {
      const roleResponse = {
        ok: true,
        role: {
          id: '507f191e810c19729de860ea',
          name: 'acme:manager',
          description: 'Manager role',
          permissions: ['327f191e810c19729de76232'],
          scope: '5b2d649ce248cb779e7f26e2',
          isSystemRole: false,
          createdAt: '2017-07-13T05:00:42.145Z',
          updatedAt: '2017-07-13T05:42:42.222Z',
        },
      };
      mock.onPost('/api/user.info').timeoutOnce();
      mock.onPost('/api/role.info').reply(200, roleResponse);

      const res = await request(server)
        .post('/api/batch')
        .set('Authorization', `Bearer ${wileSession.accessToken}`)
        .send({
          requests: [
            {
              method: 'POST',
              path: '/api/user.info',
              body: {
                id: '507f191e810c19729de860ea',
              },
            },
            {
              method: 'POST',
              path: '/api/role.info',
              body: {
                id: '507f191e810c19729de860fa',
              },
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
        responses: [
          {
            ok: false,
            error: { code: 504 },
            ts: expect.any(Number),
          },
          roleResponse,
        ],
      });
    });
  });
});
