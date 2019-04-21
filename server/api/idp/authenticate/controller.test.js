/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import config from '../../../../yeep.config';

describe('api/idp.authenticate', () => {
  // let ctx;

  beforeAll(async () => {
    await server.setup(config);
    // ctx = server.getAppContext();
  });

  afterAll(async () => {
    await server.teardown();
  });

  test('returns error when provider is undefined', async () => {
    const res = await request(server)
      .post('/api/idp.authenticate')
      .send();

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 400,
        message: 'Invalid request body',
        details: expect.any(Array),
      },
    });
    expect(res.body.error.details[0].path).toEqual(['provider']);
    expect(res.body.error.details[0].type).toBe('any.required');
  });

  test('returns error when provider is unknown', async () => {
    const res = await request(server)
      .post('/api/idp.authenticate')
      .send({
        provider: 'known-unknown',
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
    expect(res.body.error.details[0].path).toEqual(['provider']);
    expect(res.body.error.details[0].type).toBe('any.allowOnly');
  });

  test('returns error when redirectUri is undefined', async () => {
    const res = await request(server)
      .post('/api/idp.authenticate')
      .send({
        provider: 'github',
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
    expect(res.body.error.details[0].path).toEqual(['redirectUri']);
    expect(res.body.error.details[0].type).toBe('any.required');
  });

  test('returns error when redirectUri is invalid', async () => {
    const res = await request(server)
      .post('/api/idp.authenticate')
      .send({
        provider: 'github',
        redirectUri: 'ftp://10.0.0.23',
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
    expect(res.body.error.details[0].path).toEqual(['redirectUri']);
    expect(res.body.error.details[0].type).toBe('string.uriCustomScheme');
  });

  test('returns error when redirectUri is not allowed in yeep config', async () => {
    const res = await request(server)
      .post('/api/idp.authenticate')
      .send({
        provider: 'github',
        redirectUri: 'http://www.foobar.com',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10037,
        message: 'Invalid redirect URI',
      },
    });
  });

  test('returns error when provider is not enabled in yeep config', async () => {
    const res = await request(server)
      .post('/api/idp.authenticate')
      .send({
        provider: 'google',
        redirectUri: 'https://dev.yeep.io',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 10036,
        message: 'Identity provider "google" not found',
      },
    });
  });

  test('returns URL to redirect to', async () => {
    const res = await request(server)
      .post('/api/idp.authenticate')
      .send({
        provider: 'github',
        redirectUri: 'https://dev.yeep.io',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      url: expect.any(String),
    });
  });
});
