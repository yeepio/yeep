/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import createPermission from './service';
import deletePermission from '../delete/service';
import createUser from '../../user/create/service';
// import createOrg from '../../org/create/service';
import deleteUser from '../../user/delete/service';
// import deleteOrg from '../../org/delete/service';
import createSessionToken from '../../session/create/service';
import destroySessionToken from '../../session/destroy/service';
import createPermissionAssignment from '../../user/assignPermission/service';
import deletePermissionAssignment from '../../user/revokePermission/service';

describe('api/v1/permission.create', () => {
  let ctx;

  beforeAll(async () => {
    await server.setup();
    ctx = server.getAppContext();

    // ctx.org = await createOrg(ctx.db, {
    //   name: 'Acme Inc',
    //   slug: 'acme',
    // });

    ctx.user = await createUser(ctx.db, {
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

    ctx.session = await createSessionToken(ctx.db, ctx.jwt, {
      username: 'wile',
      password: 'catch-the-b1rd$',
    });
  });

  afterAll(async () => {
    await destroySessionToken(ctx.db, ctx.session);
    // await deleteOrg(ctx.db, ctx.org);
    await deleteUser(ctx.db, ctx.user);
    await server.teardown();
  });

  describe('authorized user', () => {
    beforeAll(async () => {
      const PermissionModel = ctx.db.model('Permission');
      const permission = await PermissionModel.findOne({
        name: 'yeep.permission.write',
        scope: { $exists: false },
      });
      ctx.permissionAssignment = await createPermissionAssignment(ctx.db, {
        userId: ctx.user.id,
        // orgId: ctx.org.id,
        permissionId: permission.id,
      });
    });

    afterAll(async () => {
      await deletePermissionAssignment(ctx.db, ctx.permissionAssignment);
    });

    test('returns error when permission already exists', async () => {
      const permission = await createPermission(ctx.db, {
        name: 'yeep.permission.test',
        description: 'This is a test',
      });

      const res = await request(server)
        .post('/api/v1/permission.create')
        .set('Authorization', `Bearer ${ctx.session.token}`)
        .send({
          name: 'yeep.permission.test',
          description: 'This is a tost',
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10007,
          message: 'Permission "yeep.permission.test" with global scope already exists',
        },
      });

      const isPermissionDeleted = await deletePermission(ctx.db, permission);
      expect(isPermissionDeleted).toBe(true);
    });

    test('returns error when permission + scope already exists', async () => {
      const permission = await createPermission(ctx.db, {
        name: 'yeep.permission.test',
        description: 'This is a test',
        scope: '5b2d646ce248cb779e7f26cc',
      });

      const res = await request(server)
        .post('/api/v1/permission.create')
        .set('Authorization', `Bearer ${ctx.session.token}`)
        .send({
          name: 'yeep.permission.test',
          description: 'This is a tost',
          scope: '5b2d646ce248cb779e7f26cc',
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10007,
          message:
            'Permission "yeep.permission.test" with 5b2d646ce248cb779e7f26cc scope already exists',
        },
      });

      const isPermissionDeleted = await deletePermission(ctx.db, permission);
      expect(isPermissionDeleted).toBe(true);
    });

    test('creates new permission and returns expected response', async () => {
      let res = await request(server)
        .post('/api/v1/permission.create')
        .set('Authorization', `Bearer ${ctx.session.token}`)
        .send({
          name: 'yeep.permission.test',
          description: 'This is a test',
          scope: '5b2d649ce248cb779e7f26e2',
        });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        ok: true,
        permission: expect.objectContaining({
          id: expect.any(String),
          name: 'yeep.permission.test',
          description: 'This is a test',
          scope: '5b2d649ce248cb779e7f26e2',
          isSystemPermission: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      });

      const isPermissionDeleted = await deletePermission(ctx.db, {
        id: res.body.permission.id,
      });
      expect(isPermissionDeleted).toBe(true);
    });
  });
});
