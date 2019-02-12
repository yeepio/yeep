/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import config from '../../../../yeep.config';
import deleteUser from '../delete/service';
import createUser from './service';
import deletePermissionAssignment from '../revokePermission/service';
import destroySession from '../../session/destroy/service';
import createSession from '../../session/create/service';
import createPermissionAssignment from '../assignPermission/service';
import createOrg from '../../org/create/service';
import deleteOrg from '../../org/delete/service';

describe('api/v1/user.create', () => {
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
        .post('/api/v1/user.create')
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
    let org;
    let requestor;
    let permissionAssignment;
    let session;

    beforeAll(async () => {
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
      });

      org = await createOrg(ctx.db, {
        name: 'Acme Inc',
        slug: 'acme',
        adminId: requestor.id,
      });

      const PermissionModel = ctx.db.model('Permission');
      const permission = await PermissionModel.findOne({
        name: 'yeep.user.write',
      });
      permissionAssignment = await createPermissionAssignment(ctx.db, {
        userId: requestor.id,
        orgId: null, // global scope
        permissionId: permission.id,
      });

      session = await createSession(ctx, {
        username: 'wile',
        password: 'catch-the-b1rd$',
      });
    });

    afterAll(async () => {
      await destroySession(ctx, session);
      await deletePermissionAssignment(ctx.db, permissionAssignment);
      await deleteUser(ctx.db, requestor);
      await deleteOrg(ctx.db, org);
    });

    describe('isUsernameEnabled = true', () => {
      test('returns error when `username` is unspecified', async () => {
        const res = await request(server)
          .post('/api/v1/user.create')
          .set('Authorization', `Bearer ${session.accessToken}`)
          .send({
            password: 'fast+furry-ous',
            fullName: 'Road Runner',
            emails: [
              {
                address: 'beep-beep@acme.com',
                isVerified: false,
                isPrimary: false,
              },
            ],
            orgs: [org.id],
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
        expect(res.body.error.details[0].path).toEqual(['username']);
        expect(res.body.error.details[0].type).toBe('any.required');
      });

      test('returns error when `emails` contains duplicate addresses', async () => {
        const res = await request(server)
          .post('/api/v1/user.create')
          .set('Authorization', `Bearer ${session.accessToken}`)
          .send({
            username: 'runner',
            password: 'fast+furry-ous',
            fullName: 'Road Runner',
            emails: [
              {
                address: 'beep-beep@acme.com',
                isVerified: false,
                isPrimary: false,
              },
              {
                address: 'beep-beep@acme.com',
                isVerified: false,
                isPrimary: false,
              },
            ],
            orgs: [org.id],
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
        expect(res.body.error.details[0].path).toEqual(['emails', 1]);
        expect(res.body.error.details[0].type).toBe('array.unique');
      });

      test('returns error when primary email is not specified', async () => {
        const res = await request(server)
          .post('/api/v1/user.create')
          .set('Authorization', `Bearer ${session.accessToken}`)
          .send({
            username: 'runner',
            password: 'fast+furry-ous',
            fullName: 'Road Runner',
            emails: [
              {
                address: 'beep-beep@acme.com',
                isVerified: false,
                isPrimary: false,
              },
              {
                address: 'roadrunner@acme.com',
                isVerified: false,
                isPrimary: false,
              },
            ],
            orgs: [org.id],
          });

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
          ok: false,
          error: {
            code: 10004,
            message: 'You must specify at least 1 primary email',
          },
        });
      });

      test('throws error when multiple primary emails are specified', async () => {
        const res = await request(server)
          .post('/api/v1/user.create')
          .set('Authorization', `Bearer ${session.accessToken}`)
          .send({
            username: 'runner',
            password: 'fast+furry-ous',
            fullName: 'Road Runner',
            emails: [
              {
                address: 'beep-beep@acme.com',
                isVerified: false,
                isPrimary: true,
              },
              {
                address: 'roadrunner@acme.com',
                isVerified: false,
                isPrimary: true,
              },
            ],
            orgs: [org.id],
          });

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
          ok: false,
          error: {
            code: 10004,
            message: expect.any(String),
          },
        });
      });

      test('creates new user and returns expected response', async () => {
        const res = await request(server)
          .post('/api/v1/user.create')
          .set('Authorization', `Bearer ${session.accessToken}`)
          .send({
            username: 'runner',
            password: 'fast+furry-ous',
            fullName: 'Road Runner',
            emails: [
              {
                address: 'beep-beep@acme.com',
                isVerified: true,
                isPrimary: true,
              },
            ],
            orgs: [org.id],
          });
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
          ok: true,
          user: expect.objectContaining({
            id: expect.any(String),
            username: 'runner',
            fullName: 'Road Runner',
            picture: null,
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

        const isUserDeleted = await deleteUser(ctx.db, res.body.user);
        expect(isUserDeleted).toBe(true);
      });

      test('returns error on duplicate username', async () => {
        const user = await createUser(ctx.db, {
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

        const res = await request(server)
          .post('/api/v1/user.create')
          .set('Authorization', `Bearer ${session.accessToken}`)
          .send({
            username: 'runner',
            password: 'fast+furry-ous!!',
            fullName: 'Road Runner Jr.',
            emails: [
              {
                address: 'roadrunnerjr@acme.com',
                isVerified: true,
                isPrimary: true,
              },
            ],
            orgs: [org.id],
          });
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
          ok: false,
          error: {
            code: 10006,
            message: expect.any(String),
          },
        });

        const isUserDeleted = await deleteUser(ctx.db, user);
        expect(isUserDeleted).toBe(true);
      });

      test('returns error on duplicate email address', async () => {
        const user = await createUser(ctx.db, {
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
            {
              address: 'roadrunner@acme.com',
              isVerified: false,
              isPrimary: false,
            },
          ],
        });

        const res = await request(server)
          .post('/api/v1/user.create')
          .set('Authorization', `Bearer ${session.accessToken}`)
          .send({
            username: 'roadrunner',
            password: 'fast+furry-ous',
            fullName: 'Road Runner',
            emails: [
              {
                address: 'RoadRunner@acme.com', // case-insensitive
                isVerified: true,
                isPrimary: true,
              },
            ],
            orgs: [org.id],
          });
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
          ok: false,
          error: {
            code: 10005,
            message: expect.any(String),
          },
        });

        const isUserDeleted = await deleteUser(ctx.db, user);
        expect(isUserDeleted).toBe(true);
      });

      // test('returns error when creating global user without necessary permission', async () => {
      //   const res = await request(server)
      //     .post('/api/v1/user.create')
      //     .set('Authorization', `Bearer ${session.accessToken}`)
      //     .send({
      //       // absense of orgs denotes global user
      //       username: 'roadrunner',
      //       password: 'fast+furry-ous',
      //       fullName: 'Road Runner',
      //       emails: [
      //         {
      //           address: 'RoadRunner@acme.com', // case-insensitive
      //           isVerified: true,
      //           isPrimary: true,
      //         },
      //       ],
      //     });
      //   expect(res.status).toBe(200);
      //   expect(res.body).toMatchObject({
      //     ok: false,
      //     error: {
      //       code: 10012,
      //       message: expect.any(String),
      //     },
      //   });
      // });
    });

    describe('isUsernameEnabled = false', () => {
      beforeAll(async () => {
        ctx.config.isUsernameEnabled = false;
      });

      afterAll(async () => {
        ctx.config.isUsernameEnabled = true;
      });

      test('returns error when `username` is specified', async () => {
        const res = await request(server)
          .post('/api/v1/user.create')
          .set('Authorization', `Bearer ${session.accessToken}`)
          .send({
            username: 'runner',
            password: 'fast+furry-ous',
            fullName: 'Road Runner',
            emails: [
              {
                address: 'beep-beep@acme.com',
                isVerified: false,
                isPrimary: false,
              },
            ],
            orgs: [org.id],
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
        expect(res.body.error.details[0].path).toEqual(['username']);
        expect(res.body.error.details[0].type).toBe('any.forbidden');
      });

      test('creates new user and returns response without username', async () => {
        const res = await request(server)
          .post('/api/v1/user.create')
          .set('Authorization', `Bearer ${session.accessToken}`)
          .send({
            password: 'fast+furry-ous',
            fullName: 'Road Runner',
            emails: [
              {
                address: 'beep-beep@acme.com',
                isVerified: true,
                isPrimary: true,
              },
            ],
            orgs: [org.id],
          });
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
          ok: true,
          user: expect.not.objectContaining({
            username: 'runner',
          }),
        });

        const isUserDeleted = await deleteUser(ctx.db, res.body.user);
        expect(isUserDeleted).toBe(true);
      });

      test('accepts multiple users without username_uidx complaining', async () => {
        const [res1, res2] = await Promise.all([
          request(server)
            .post('/api/v1/user.create')
            .set('Authorization', `Bearer ${session.accessToken}`)
            .send({
              password: 'fast+furry-ous',
              fullName: 'Road Runner',
              emails: [
                {
                  address: 'beep-beep@acme.com',
                  isVerified: true,
                  isPrimary: true,
                },
              ],
              orgs: [org.id],
            }),
          request(server)
            .post('/api/v1/user.create')
            .set('Authorization', `Bearer ${session.accessToken}`)
            .send({
              password: 'thats-all-folks!',
              fullName: 'Porky Pig',
              emails: [
                {
                  address: 'ham@acme.com',
                  isVerified: true,
                  isPrimary: true,
                },
              ],
              orgs: [org.id],
            }),
        ]);
        expect(res1.body).toEqual({
          ok: true,
          user: expect.any(Object),
        });
        expect(res2.body).toEqual({
          ok: true,
          user: expect.any(Object),
        });

        const [isUser1Deleted, isUser2Deleted] = await Promise.all([
          deleteUser(ctx.db, res1.body.user),
          deleteUser(ctx.db, res2.body.user),
        ]);
        expect(isUser1Deleted).toBe(true);
        expect(isUser2Deleted).toBe(true);
      });
    });
  });
});
