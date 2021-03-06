/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import config from '../../../../yeep.config';
import createPermission from '../create/service';
import deletePermission from '../delete/service';
import createUser from '../../user/create/service';
import createPermissionAssignment from '../../user/assignPermission/service';
import createOrg from '../../org/create/service';
import { createSession, signBearerJWT } from '../../session/issueToken/service';
import { destroySession } from '../../session/destroyToken/service';
import deletePermissionAssignment from '../../user/revokePermission/service';
import deleteOrg from '../../org/delete/service';
import deleteUser from '../../user/delete/service';

describe('api/permission.info', () => {
  let ctx;
  let user;
  let org;
  let permissionAssignment;
  let session;
  let bearerToken;

  beforeAll(async () => {
    await server.setup(config);
    ctx = server.getAppContext();

    user = await createUser(ctx, {
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
      adminId: user.id,
    });

    const PermissionModel = ctx.db.model('Permission');
    const permission = await PermissionModel.findOne({ name: 'yeep.permission.read' });
    permissionAssignment = await createPermissionAssignment(ctx, {
      userId: user.id,
      orgId: org.id,
      permissionId: permission.id,
    });

    session = await createSession(ctx, {
      username: 'wile',
      password: 'catch-the-b1rd$',
    });
    bearerToken = await signBearerJWT(ctx, session);
  });

  afterAll(async () => {
    await destroySession(ctx, session);
    await deletePermissionAssignment(ctx, permissionAssignment);
    await deleteOrg(ctx, org);
    await deleteUser(ctx, user);
    await server.teardown();
  });

  test('returns error when permission does not exist', async () => {
    const res = await request(server)
      .post('/api/permission.info')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        id: '5b2d5dd0cd86b77258e16d39', // some random objectid
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10008,
        message: 'Permission 5b2d5dd0cd86b77258e16d39 not found',
      },
    });
  });

  describe('successful request', () => {
    let permission;

    beforeAll(async () => {
      permission = await createPermission(ctx, {
        name: 'acme.test',
        description: 'This is a test',
        scope: org.id,
      });
    });

    afterAll(async () => {
      await deletePermission(ctx, permission);
    });

    test('retrieves permission info', async () => {
      const res = await request(server)
        .post('/api/permission.info')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send({
          id: permission.id,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
        permission: {
          id: permission.id,
          name: expect.any(String),
          description: expect.any(String),
          isSystemPermission: expect.any(Boolean),
          roles: expect.any(Array),
          org: expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
          }),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      });
    });
  });

  describe('permission out of scope', () => {
    let permission;

    beforeAll(async () => {
      permission = await createPermission(ctx, {
        // note the absence of scope to denote global permission
        name: 'acme.test',
        description: 'This is a test',
      });
    });

    afterAll(async () => {
      await deletePermission(ctx, permission);
    });

    test('returns error', async () => {
      const res = await request(server)
        .post('/api/permission.info')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send({
          id: permission.id,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        error: {
          code: 10012,
          message: `User ${user.id} does not have sufficient permissions to access this resource`,
        },
      });
    });
  });
});
