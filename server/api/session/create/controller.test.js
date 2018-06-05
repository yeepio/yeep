/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';

describe('api/v1/session.create', () => {
  beforeAll(async () => {
    await server.setup();
  });

  afterAll(async () => {
    await server.teardown();
  });

  test('throws 400 "Bad Request" when username is invalid', async () => {
    const res = await request(server)
      .post('/api/v1/session.create')
      .send({
        username: 'a',
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

  test('throws "UserNotFoundError" error when user does not exist', async () => {
    const res = await request(server)
      .post('/api/v1/session.create')
      .send({
        username: 'notuser',
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

  test('throws "InvalidCredentialsError" error when password is invalid', async () => {
    let res = await request(server)
      .post('/api/v1/user.create')
      .send({
        username: 'Wile',
        password: 'catch-the-b1rd$',
        fullName: 'Wile E. Coyote',
        emails: [
          {
            address: 'coyote@acme.com',
            isVerified: true,
            isPrimary: true,
          },
        ],
      });
    expect(res.status).toBe(201);
    const { id: userId } = res.body.user;

    res = await request(server)
      .post('/api/v1/session.create')
      .send({
        username: 'wile',
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

    res = await request(server)
      .post('/api/v1/user.delete')
      .send({ id: userId });
    expect(res.status).toBe(204);
  });

  // test('throws 422 "Bad Request" when multiple primary emails are specified', async () => {
  //   const res = await request(server)
  //     .post('/api/v1/session.create')
  //     .send({
  //       username: 'wile',
  //       password: 'catch-the-b1rd$',
  //       fullName: 'Wile E. Coyote',
  //       emails: [
  //         {
  //           address: 'coyote@acme.com',
  //           isVerified: false,
  //           isPrimary: true,
  //         },
  //         {
  //           address: 'wile@acme.com',
  //           isVerified: false,
  //           isPrimary: true,
  //         },
  //       ],
  //     });

  //   expect(res.status).toBe(422);
  //   expect(res.body.message).toBe(
  //     'User cannot have more than 1 primary emails'
  //   );
  // });

  test('creates new session', async () => {
    let res = await request(server)
      .post('/api/v1/user.create')
      .send({
        username: 'Wile',
        password: 'catch-the-b1rd$',
        fullName: 'Wile E. Coyote',
        emails: [
          {
            address: 'coyote@acme.com',
            isVerified: true,
            isPrimary: true,
          },
        ],
      });
    expect(res.status).toBe(201);
    const { id: userId } = res.body.user;

    res = await request(server)
      .post('/api/v1/session.create')
      .send({
        username: 'Wile',
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

    res = await request(server)
      .post('/api/v1/user.delete')
      .send({ id: userId });
    expect(res.status).toBe(204);
  });

  // test('throws 409 "Conflict" on duplicate username', async () => {
  //   let res = await request(server)
  //     .post('/api/v1/session.create')
  //     .send({
  //       username: 'Wile',
  //       password: 'catch-the-b1rd$',
  //       fullName: 'Wile E. Coyote',
  //       emails: [
  //         {
  //           address: 'coyote@acme.com',
  //           isVerified: true,
  //           isPrimary: true,
  //         },
  //       ],
  //     });
  //   expect(res.status).toBe(201);

  //   const { id } = res.body.user;

  //   res = await request(server)
  //     .post('/api/v1/session.create')
  //     .send({
  //       username: 'wile',
  //       password: 'play-wolf',
  //       fullName: 'Road Runner',
  //       emails: [
  //         {
  //           address: 'beep-beep@acme.com',
  //           isVerified: true,
  //           isPrimary: true,
  //         },
  //       ],
  //     });
  //   expect(res.status).toBe(409);
  //   expect(res.body.message).toMatch(/username/i);

  //   res = await request(server)
  //     .post('/api/v1/session.delete')
  //     .send({ id });
  //   expect(res.status).toBe(204);
  // });

  // test('throws 409 "Conflict" on duplicate email address', async () => {
  //   let res = await request(server)
  //     .post('/api/v1/session.create')
  //     .send({
  //       username: 'Wile',
  //       password: 'catch-the-b1rd$',
  //       fullName: 'Wile E. Coyote',
  //       emails: [
  //         {
  //           address: 'coyote@acme.com',
  //           isVerified: true,
  //           isPrimary: true,
  //         },
  //         {
  //           address: 'carnivorous@acme.com',
  //           isVerified: false,
  //           isPrimary: false,
  //         },
  //       ],
  //     });
  //   expect(res.status).toBe(201);

  //   const { id } = res.body.user;

  //   res = await request(server)
  //     .post('/api/v1/session.create')
  //     .send({
  //       username: 'roadrunner',
  //       password: 'play-wolf',
  //       fullName: 'Road Runner',
  //       emails: [
  //         {
  //           address: 'Carnivorous@acme.com',
  //           isVerified: true,
  //           isPrimary: true,
  //         },
  //       ],
  //     });
  //   expect(res.status).toBe(409);
  //   expect(res.body.message).toMatch(/email address/i);

  //   res = await request(server)
  //     .post('/api/v1/session.delete')
  //     .send({ id });
  //   expect(res.status).toBe(204);
  // });
});
