/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import config from '../../../../yeep.config';
import createUser from '../../user/create/service';
import deleteUser from '../../user/delete/service';
import createOrg from '../../org/create/service';
import deleteOrg from '../../org/delete/service';
import createPermissionAssignment from '../../user/assignPermission/service';
import createPermission from '../../permission/create/service';
import deletePermission from '../../permission/delete/service';
import deletePermissionAssignment from '../../user/revokePermission/service';

describe('api/v1/session.create', () => {
  let ctx;
  let wile;

  beforeAll(async () => {
    await server.setup(config);
    ctx = server.getAppContext();

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
  });

  afterAll(async () => {
    await deleteUser(ctx.db, wile);
    await server.teardown();
  });

  test('returns error when username is invalid', async () => {
    const res = await request(server)
      .post('/api/v1/session.create')
      .send({
        user: 'a',
        password: 'password',
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
  });

  test('returns error when email does not exist', async () => {
    const res = await request(server)
      .post('/api/v1/session.create')
      .send({
        user: 'unknown@email.com',
        password: 'password',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10001,
        message: expect.any(String),
      },
    });
  });

  test('returns error when username does not exist', async () => {
    const res = await request(server)
      .post('/api/v1/session.create')
      .send({
        user: 'notuser',
        password: 'password',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10001,
        message: expect.any(String),
      },
    });
  });

  test('returns error when password is invalid', async () => {
    const res = await request(server)
      .post('/api/v1/session.create')
      .send({
        user: 'wile',
        password: 'invalid-password',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10002,
        message: expect.any(String),
      },
    });
  });

  test('creates new session with username + password', async () => {
    const res = await request(server)
      .post('/api/v1/session.create')
      .send({
        user: 'Wile', // this will be automaticaly lower-cased
        password: 'catch-the-b1rd$',
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        ok: true,
        token: expect.any(String),
        expiresIn: expect.any(Number),
      })
    );
  });

  test('creates new session with email address + password', async () => {
    const res = await request(server)
      .post('/api/v1/session.create')
      .send({
        user: 'coyote@acme.com',
        password: 'catch-the-b1rd$',
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        ok: true,
        token: expect.any(String),
        expiresIn: expect.any(Number),
      })
    );
  });

  describe('user with explicit permissions', () => {
    let acme;
    let permission;
    let permissionAssignment;

    beforeAll(async () => {
      acme = await createOrg(ctx.db, {
        name: 'Acme Inc',
        slug: 'acme',
        adminId: wile.id,
      });

      permission = await createPermission(ctx.db, {
        name: 'acme.test',
        description: 'Test permission',
        scope: acme.id,
      });

      permissionAssignment = await createPermissionAssignment(ctx.db, {
        userId: wile.id,
        orgId: acme.id,
        permissionId: permission.id,
      });
    });

    afterAll(async () => {
      await deletePermissionAssignment(ctx.db, permissionAssignment);
      await deleteOrg(ctx.db, acme);
      await deletePermission(ctx.db, permission);
    });

    test('includes permissions when `includePermissions` is true', async () => {
      const res = await request(server)
        .post('/api/v1/session.create')
        .send({
          user: 'Wile', // this will be automaticaly lower-cased
          password: 'catch-the-b1rd$',
          includePermissions: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);

      const tokenPayload = await ctx.jwt.verify(res.body.token);
      expect(tokenPayload).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          permissions: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              name: expect.any(String),
              isSystemPermission: expect.any(Boolean),
              orgId: acme.id,
            }),
          ]),
        })
      );
    });

    test('does not include permissions by default', async () => {
      const res = await request(server)
        .post('/api/v1/session.create')
        .send({
          user: 'Wile', // this will be automaticaly lower-cased
          password: 'catch-the-b1rd$',
        });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);

      const tokenPayload = await ctx.jwt.verify(res.body.token);
      expect(tokenPayload).toEqual(
        expect.objectContaining({
          id: expect.any(String),
        })
      );
      expect(tokenPayload.permissions).toBeUndefined();
    });
  });
});
