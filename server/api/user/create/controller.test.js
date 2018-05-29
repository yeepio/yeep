/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';

describe('api/v1/user.create', () => {
  beforeAll(async () => {
    await server.setup();
  });

  afterAll(async () => {
    await server.teardown();
  });

  test('throws 400 "Bad Request" when `emails` contains duplicate addresses', async () => {
    const res = await request(server)
      .post('/api/v1/user.create')
      .send({
        username: 'wile',
        password: 'catch-the-b1rd$',
        fullName: 'Wile E. Coyote',
        emails: [
          {
            address: 'coyote@acme.com',
            isVerified: false,
            isPrimary: false,
          },
          {
            address: 'coyote@acme.com',
            isVerified: false,
            isPrimary: false,
          },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.details[0].path).toEqual(['emails', 1]);
    expect(res.body.details[0].type).toBe('array.unique');
  });

  test('throws 422 "Bad Request" when primary email is not specified', async () => {
    const res = await request(server)
      .post('/api/v1/user.create')
      .send({
        username: 'wile',
        password: 'catch-the-b1rd$',
        fullName: 'Wile E. Coyote',
        emails: [
          {
            address: 'coyote@acme.com',
            isVerified: false,
            isPrimary: false,
          },
          {
            address: 'wile@acme.com',
            isVerified: false,
            isPrimary: false,
          },
        ],
      });

    expect(res.status).toBe(422);
    expect(res.body.message).toBe('You must specify at least 1 primary email');
  });

  test('throws 422 "Bad Request" when multiple primary emails are specified', async () => {
    const res = await request(server)
      .post('/api/v1/user.create')
      .send({
        username: 'wile',
        password: 'catch-the-b1rd$',
        fullName: 'Wile E. Coyote',
        emails: [
          {
            address: 'coyote@acme.com',
            isVerified: false,
            isPrimary: true,
          },
          {
            address: 'wile@acme.com',
            isVerified: false,
            isPrimary: true,
          },
        ],
      });

    expect(res.status).toBe(422);
    expect(res.body.message).toBe(
      'User cannot have more than 1 primary emails'
    );
  });

  test('creates new user and returns 201 "Created"', async () => {
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
    expect(res.type).toMatch(/json/);
    expect(res.body).toMatchObject({
      user: expect.objectContaining({
        id: expect.any(String),
        username: 'wile',
        fullName: 'Wile E. Coyote',
        picture: null,
        emails: [
          {
            address: 'coyote@acme.com',
            isVerified: true,
            isPrimary: true,
          },
        ],
        orgs: [],
        roles: [],
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    });

    res = await request(server)
      .post('/api/v1/user.delete')
      .send({
        id: res.body.user.id,
      });
    expect(res.status).toBe(204);
  });

  test('throws 409 "Conflict" on duplicate username', async () => {
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

    const { id } = res.body.user;

    res = await request(server)
      .post('/api/v1/user.create')
      .send({
        username: 'wile',
        password: 'play-wolf',
        fullName: 'Road Runner',
        emails: [
          {
            address: 'beep-beep@acme.com',
            isVerified: true,
            isPrimary: true,
          },
        ],
      });
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/username/i);

    res = await request(server)
      .post('/api/v1/user.delete')
      .send({ id });
    expect(res.status).toBe(204);
  });

  test('throws 409 "Conflict" on duplicate email address', async () => {
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
          {
            address: 'carnivorous@acme.com',
            isVerified: false,
            isPrimary: false,
          },
        ],
      });
    expect(res.status).toBe(201);

    const { id } = res.body.user;

    res = await request(server)
      .post('/api/v1/user.create')
      .send({
        username: 'roadrunner',
        password: 'play-wolf',
        fullName: 'Road Runner',
        emails: [
          {
            address: 'Carnivorous@acme.com',
            isVerified: true,
            isPrimary: true,
          },
        ],
      });
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/email address/i);

    res = await request(server)
      .post('/api/v1/user.delete')
      .send({ id });
    expect(res.status).toBe(204);
  });
});
