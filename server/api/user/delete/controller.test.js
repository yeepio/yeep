/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import config from '../../../../yeep.config';
import createUser from '../create/service';
import createOrg from '../../org/create/service';
import createPermissionAssignment from '../assignPermission/service';
import { createSession, signBearerJWT } from '../../session/issueToken/service';
import { destroySession } from '../../session/destroyToken/service';
import deletePermissionAssignment from '../revokePermission/service';
import deleteUser from './service';
import deleteOrg from '../../org/delete/service';

describe('api/user.delete', () => {
  let ctx;

  beforeAll(async () => {
    await server.setup(config);
    ctx = server.getAppContext();
  });

  afterAll(async () => {
    await server.teardown();
  });

  describe('authorized requestor', () => {
    let acme;
    let wile;
    let session;
    let bearerToken;

    beforeAll(async () => {
      wile = await createUser(ctx, {
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

      acme = await createOrg(ctx, {
        name: 'Acme Inc',
        slug: 'acme',
        adminId: wile.id,
      });

      session = await createSession(ctx, {
        username: 'wile',
        password: 'catch-the-b1rd$',
      });
      bearerToken = await signBearerJWT(ctx, session);
    });

    afterAll(async () => {
      await destroySession(ctx, session);
      await deleteUser(ctx, wile);
      await deleteOrg(ctx, acme);
    });

    test('returns error when `id` contains invalid characters', async () => {
      const res = await request(server)
        .post('/api/user.delete')
        .set('Authorization', `Bearer ${bearerToken}`)
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
        .post('/api/user.delete')
        .set('Authorization', `Bearer ${bearerToken}`)
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
        .post('/api/user.delete')
        .set('Authorization', `Bearer ${bearerToken}`)
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
        .post('/api/user.delete')
        .set('Authorization', `Bearer ${bearerToken}`)
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
        .post('/api/user.delete')
        .set('Authorization', `Bearer ${bearerToken}`)
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

    test('deletes user and returns expected response', async () => {
      const user = await createUser(ctx, {
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
        orgs: [acme.id],
      });

      const res = await request(server)
        .post('/api/user.delete')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send({ id: user.id });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
      });
    });
  });

  describe('requestor has invalid permission scope', () => {
    let org;
    let requestor;
    let permissionAssignment;
    let session;
    let otherOrg;
    let user;
    let globalUser;
    let bearerToken;

    beforeAll(async () => {
      requestor = await createUser(ctx, {
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

      org = await createOrg(ctx, {
        name: 'Acme Inc',
        slug: 'acme',
        adminId: requestor.id,
      });

      const PermissionModel = ctx.db.model('Permission');
      const permission = await PermissionModel.findOne({
        name: 'yeep.user.write',
      });
      permissionAssignment = await createPermissionAssignment(ctx, {
        userId: requestor.id,
        orgId: org.id,
        permissionId: permission.id,
      });

      session = await createSession(ctx, {
        username: 'wile',
        password: 'catch-the-b1rd$',
      });
      bearerToken = await signBearerJWT(ctx, session);

      user = await createUser(ctx, {
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

      otherOrg = await createOrg(ctx, {
        name: 'Monsters Inc',
        slug: 'monsters',
        adminId: user.id,
      });

      globalUser = await createUser(ctx, {
        username: 'porky',
        password: "Th-th-th-that's all folks!",
        fullName: 'Porky Pig',
        picture: 'https://www.acme.com/pictures/porky.png',
        emails: [
          {
            address: 'porky@acme.com',
            isVerified: true,
            isPrimary: true,
          },
        ],
      });
    });

    afterAll(async () => {
      await destroySession(ctx, session);
      await deletePermissionAssignment(ctx, permissionAssignment);
      await deleteUser(ctx, requestor);
      await deleteUser(ctx, user);
      await deleteUser(ctx, globalUser);
      await deleteOrg(ctx, org);
      await deleteOrg(ctx, otherOrg);
    });

    test('returns error when requested user is member of another org', async () => {
      const res = await request(server)
        .post('/api/user.delete')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send({ id: user.id });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10012,
          message: `User ${
            requestor.id
          } does not have sufficient permissions to access this resource`,
        },
      });
    });

    test('returns error when requested user is NOT member of any orgs (i.e. global user)', async () => {
      const res = await request(server)
        .post('/api/user.delete')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send({ id: globalUser.id });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10012,
          message: `User ${
            requestor.id
          } does not have sufficient permissions to access this resource`,
        },
      });
    });
  });
});
