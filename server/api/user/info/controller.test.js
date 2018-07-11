/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import createOrg from '../../org/create/service';
import createUser from '../create/service';
import createPermissionAssignment from '../assignPermission/service';
import createSessionToken from '../../session/create/service';
import destroySessionToken from '../../session/destroy/service';
import deletePermissionAssignment from '../revokePermission/service';
import deleteUser from '../delete/service';
import deleteOrg from '../../org/delete/service';

describe('api/v1/user.info', () => {
  let ctx;

  beforeAll(async () => {
    await server.setup();
    ctx = server.getAppContext();
  });

  afterAll(async () => {
    await server.teardown();
  });

  describe('authorized requestor', () => {
    let org;
    let user;
    let requestor;
    let permissionAssignment;
    let session;
    let otherOrg;

    beforeAll(async () => {
      org = await createOrg(ctx.db, {
        name: 'Acme Inc',
        slug: 'acme',
      });

      requestor = await createUser(ctx.db, {
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
        orgs: [org.id],
      });

      const PermissionModel = ctx.db.model('Permission');
      const permission = await PermissionModel.findOne({
        name: 'yeep.user.read',
        scope: { $exists: false },
      });
      permissionAssignment = await createPermissionAssignment(ctx.db, {
        userId: requestor.id,
        orgId: org.id,
        permissionId: permission.id,
      });

      session = await createSessionToken(ctx.db, ctx.jwt, {
        username: 'wile',
        password: 'catch-the-b1rd$',
      });

      otherOrg = await createOrg(ctx.db, {
        name: 'Monsters Inc',
        slug: 'monsters',
      });

      user = await createUser(ctx.db, {
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
        orgs: [otherOrg.id, org.id],
      });
    });

    afterAll(async () => {
      await destroySessionToken(ctx.db, session);
      await deletePermissionAssignment(ctx.db, permissionAssignment);
      await deleteUser(ctx.db, requestor);
      await deleteOrg(ctx.db, org);
      await deleteOrg(ctx.db, otherOrg);
      await deleteUser(ctx.db, user);
    });

    test('retrieves user and returns expected response', async () => {
      const res = await request(server)
        .post('/api/v1/user.info')
        .set('Authorization', `Bearer ${session.token}`)
        .send({ id: user.id });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
        user: expect.objectContaining({
          id: expect.any(String),
          username: 'runner',
          fullName: 'Road Runner',
          picture: 'https://www.acme.com/pictures/roadrunner.png',
          emails: [
            {
              address: 'beep-beep@acme.com',
              isVerified: true,
              isPrimary: true,
            },
          ],
          orgs: expect.arrayContaining([org.id]),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      });
    });

    test('returns error when `id` contains invalid characters', async () => {
      const res = await request(server)
        .post('/api/v1/user.info')
        .set('Authorization', `Bearer ${session.token}`)
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
        .post('/api/v1/user.info')
        .set('Authorization', `Bearer ${session.token}`)
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
        .post('/api/v1/user.info')
        .set('Authorization', `Bearer ${session.token}`)
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
        .post('/api/v1/user.info')
        .set('Authorization', `Bearer ${session.token}`)
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
        .post('/api/v1/user.info')
        .set('Authorization', `Bearer ${session.token}`)
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
  });

  describe('requestor has invalid permission scope', () => {
    let org;
    let requestor;
    let permissionAssignment;
    let session;
    let otherOrg;
    let user;
    let globalUser;

    beforeAll(async () => {
      org = await createOrg(ctx.db, {
        name: 'Acme Inc',
        slug: 'acme',
      });

      requestor = await createUser(ctx.db, {
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
        orgs: [org.id],
      });

      const PermissionModel = ctx.db.model('Permission');
      const permission = await PermissionModel.findOne({
        name: 'yeep.user.read',
        scope: { $exists: false },
      });
      permissionAssignment = await createPermissionAssignment(ctx.db, {
        userId: requestor.id,
        orgId: org.id,
        permissionId: permission.id,
      });

      session = await createSessionToken(ctx.db, ctx.jwt, {
        username: 'wile',
        password: 'catch-the-b1rd$',
      });

      otherOrg = await createOrg(ctx.db, {
        name: 'Monsters Inc',
        slug: 'monsters',
      });

      user = await createUser(ctx.db, {
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
        orgs: [otherOrg.id],
      });

      globalUser = await createUser(ctx.db, {
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
      await destroySessionToken(ctx.db, session);
      await deletePermissionAssignment(ctx.db, permissionAssignment);
      await deleteUser(ctx.db, requestor);
      await deleteOrg(ctx.db, org);
      await deleteOrg(ctx.db, otherOrg);
      await deleteUser(ctx.db, user);
      await deleteUser(ctx.db, globalUser);
    });

    test('returns error when requested user is member of another org', async () => {
      const res = await request(server)
        .post('/api/v1/user.info')
        .set('Authorization', `Bearer ${session.token}`)
        .send({ id: user.id });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10012,
          message: 'User "wile" does not have permission "yeep.user.read" to access this resource',
        },
      });
    });

    test('returns error when requested user is NOT member of any orgs (i.e. global user)', async () => {
      const res = await request(server)
        .post('/api/v1/user.info')
        .set('Authorization', `Bearer ${session.token}`)
        .send({ id: globalUser.id });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10012,
          message: 'User "wile" does not have permission "yeep.user.read" to access this resource',
        },
      });
    });
  });
});
