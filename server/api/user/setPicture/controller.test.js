/* eslint-env jest */
import path from 'path';
import request from 'supertest';
import server from '../../../server';
import createUser from '../create/service';
import createPermissionAssignment from '../assignPermission/service';
import createSessionToken from '../../session/create/service';
import destroySessionToken from '../../session/destroy/service';
import deletePermissionAssignment from '../revokePermission/service';
import deleteUser from '../delete/service';
import deleteUserPicture from '../deletePicture/service';

describe('api/v1/user.setPicture', () => {
  let ctx;

  beforeAll(async () => {
    await server.setup();
    ctx = server.getAppContext();
  });

  afterAll(async () => {
    await server.teardown();
  });

  describe('unauthorized user', () => {
    test('returns error pretending resource does not exist', async () => {
      const res = await request(server)
        .post('/api/v1/user.setPicture')
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

      wileSession = await createSessionToken(ctx.db, ctx.jwt, {
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

      runnerSession = await createSessionToken(ctx.db, ctx.jwt, {
        username: 'runner',
        password: 'fast+furry-ous',
      });
    });

    afterAll(async () => {
      await destroySessionToken(ctx.db, wileSession);
      await destroySessionToken(ctx.db, runnerSession);
      await deletePermissionAssignment(ctx.db, permissionAssignment);
      await deleteUser(ctx.db, wile);
      await deleteUser(ctx.db, runner);
    });

    test('sets user profile picture', async () => {
      let res = await request(server)
        .post('/api/v1/user.setPicture')
        .set('Authorization', `Bearer ${wileSession.token}`)
        .attach('picture', path.resolve(__dirname, './__tests__/runner.png'))
        .field('id', runner.id);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
        user: expect.objectContaining({
          id: expect.any(String),
          picture: expect.any(String),
          updatedAt: expect.any(String),
        }),
      });

      const filename = ctx.storage.relative(res.body.user.picture);
      await expect(ctx.storage.existsFile(filename)).resolves.toBe(true);

      await deleteUserPicture(ctx.db, ctx.storage, res.body.user);
    });

    test('returns error when `id` contains invalid characters', async () => {
      const res = await request(server)
        .post('/api/v1/user.setPicture')
        .set('Authorization', `Bearer ${wileSession.token}`)
        .attach('picture', path.resolve(__dirname, './__tests__/coyote.jpg'))
        .field('id', '507f1f77bcf86cd79943901@');
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
        .post('/api/v1/user.setPicture')
        .set('Authorization', `Bearer ${wileSession.token}`)
        .attach('picture', path.resolve(__dirname, './__tests__/coyote.jpg'))
        .field('id', '507f1f77bcf86cd7994390112');
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
        .post('/api/v1/user.setPicture')
        .set('Authorization', `Bearer ${wileSession.token}`)
        .attach('picture', path.resolve(__dirname, './__tests__/coyote.jpg'))
        .field('id', '507f1f77bcf86cd79943901');
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
        .post('/api/v1/user.setPicture')
        .set('Authorization', `Bearer ${wileSession.token}`)
        .attach('picture', path.resolve(__dirname, './__tests__/coyote.jpg'));
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
        .post('/api/v1/user.setPicture')
        .set('Authorization', `Bearer ${wileSession.token}`)
        .attach('picture', path.resolve(__dirname, './__tests__/coyote.jpg'))
        .field('id', '507f1f77bcf86cd799439011')
        .field('foo', 'bar');
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
        .post('/api/v1/user.setPicture')
        .set('Authorization', `Bearer ${runnerSession.token}`)
        .attach('picture', path.resolve(__dirname, './__tests__/coyote.jpg'))
        .field('id', wile.id);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10012,
          message: expect.any(String),
        },
      });
    });

    test('can set their own profile picture', async () => {
      let res = await request(server)
        .post('/api/v1/user.setPicture')
        .set('Authorization', `Bearer ${runnerSession.token}`)
        .attach('picture', path.resolve(__dirname, './__tests__/runner.png'))
        .field('id', runner.id);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
        user: expect.objectContaining({
          id: expect.any(String),
          picture: expect.any(String),
          updatedAt: expect.any(String),
        }),
      });

      const filename = ctx.storage.relative(res.body.user.picture);
      await expect(ctx.storage.existsFile(filename)).resolves.toBe(true);

      await deleteUserPicture(ctx.db, ctx.storage, res.body.user);
    });
  });
});