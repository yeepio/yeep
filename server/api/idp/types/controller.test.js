/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';
import config from '../../../../yeep.config';

describe('api/idp.types', () => {
  beforeAll(async () => {
    await server.setup(config);
  });

  afterAll(async () => {
    await server.teardown();
  });

  test('returns error when payload contains unknown properties', async () => {
    const res = await request(server)
      .post('/api/idp.types')
      .send({
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

  test('returns identity provider types', async () => {
    const res = await request(server)
      .post('/api/idp.types')
      .send();

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      types: expect.arrayContaining([
        expect.objectContaining({
          name: expect.any(String),
          type: expect.any(String),
          protocol: expect.any(String),
          logo: expect.objectContaining({
            mime: expect.any(String),
            extension: expect.any(String),
            value: expect.any(String),
          }),
        }),
      ]),
    });
  });

  test('filters identity provider types by search query', async () => {
    const res = await request(server)
      .post('/api/idp.types')
      .send({
        q: 'git',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      types: expect.arrayContaining([
        expect.objectContaining({
          name: 'GitHub',
          type: 'GITHUB',
          protocol: 'OAUTH',
        }),
      ]),
    });
  });

  test('returns empty array when search query does not yield results', async () => {
    const res = await request(server)
      .post('/api/idp.types')
      .send({
        q: 'foobar',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      types: [],
    });
  });
});
