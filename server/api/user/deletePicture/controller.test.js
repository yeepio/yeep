/* eslint-env jest */
import path from 'path';
import request from 'supertest';
import server from '../../../server';
import config from '../../../../yeep.config';
import createUser from '../create/service';
import createPermissionAssignment from '../assignPermission/service';
import createSession from '../../session/create/service';
import destroySession from '../../session/destroy/service';
import deletePermissionAssignment from '../revokePermission/service';
import deleteUser from '../delete/service';

describe('api/user.deletePicture', () => {
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
        .post('/api/user.deletePicture')
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
    let runner;
    let wile;
    let permissionAssignment;
    let wileSession;
    let runnerSession;

    beforeAll(async () => {
      wile = await createUser(ctx.db, {
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

      const PermissionModel = ctx.db.model('Permission');
      const permission = await PermissionModel.findOne({
        name: 'yeep.user.write',
      });
      permissionAssignment = await createPermissionAssignment(ctx.db, {
        userId: wile.id,
        permissionId: permission.id,
        // global org
      });

      wileSession = await createSession(ctx, {
        username: 'wile',
        password: 'catch-the-b1rd$',
      });

      runner = await createUser(ctx.db, {
        username: 'runner',
        password: 'fast+furry-ous',
        fullName: 'Road Runner',
        picture: 'https://www.acme.com/pictures/roadrunner.png',
        emails: [
          {
            address: 'beep-beep@acme.com',
            isVerified: true,
            isPrimary: true,
          },
        ],
      });

      runnerSession = await createSession(ctx, {
        username: 'runner',
        password: 'fast+furry-ous',
      });
    });

    afterAll(async () => {
      await destroySession(ctx, wileSession);
      await destroySession(ctx, runnerSession);
      await deletePermissionAssignment(ctx.db, permissionAssignment);
      await deleteUser(ctx.db, wile);
      await deleteUser(ctx.db, runner);
    });

    test('deletes user profile picture', async () => {
      let res = await request(server)
        .post('/api/user.setPicture')
        .set('Authorization', `Bearer ${wileSession.accessToken}`)
        .attach('picture', path.resolve(__dirname, '../setPicture/__tests__/runner.png'))
        .field('id', runner.id);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
      });

      res = await request(server)
        .post('/api/user.deletePicture')
        .set('Authorization', `Bearer ${wileSession.accessToken}`)
        .send({
          id: runner.id,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
        user: expect.objectContaining({
          id: expect.any(String),
          picture: null,
          updatedAt: expect.any(String),
        }),
      });
    });

    test('returns error when `id` contains invalid characters', async () => {
      const res = await request(server)
        .post('/api/user.deletePicture')
        .set('Authorization', `Bearer ${wileSession.accessToken}`)
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
        .post('/api/user.deletePicture')
        .set('Authorization', `Bearer ${wileSession.accessToken}`)
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
        .post('/api/user.deletePicture')
        .set('Authorization', `Bearer ${wileSession.accessToken}`)
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
        .post('/api/user.deletePicture')
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
      expect(res.body.error.details[0].path).toEqual(['id']);
      expect(res.body.error.details[0].type).toBe('any.required');
    });

    test('returns error when payload contains unknown properties', async () => {
      const res = await request(server)
        .post('/api/user.deletePicture')
        .set('Authorization', `Bearer ${wileSession.accessToken}`)
        .send({
          id: '507f1f77bcf86cd799439011',
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

    test('returns error with invalid permission scope', async () => {
      const res = await request(server)
        .post('/api/user.deletePicture')
        .set('Authorization', `Bearer ${runnerSession.accessToken}`)
        .send({
          id: wile.id,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10012,
          message: expect.any(String),
        },
      });
    });

    test('can delete their own profile picture', async () => {
      const res = await request(server)
        .post('/api/user.deletePicture')
        .set('Authorization', `Bearer ${runnerSession.accessToken}`)
        .send({
          id: runner.id,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
        user: expect.objectContaining({
          id: expect.any(String),
          picture: null,
          updatedAt: expect.any(String),
        }),
      });
    });
  });
});
