/* eslint-env jest */
import request from 'supertest';
import server from '../../server';

describe('api/v1/ping', () => {
  test('responds as expected', async () => {
    const res = await request(server).get('/api/v1/ping');
    expect(res.status).toEqual(200);
    expect(res.type).toMatch(/json/);
    expect(res.body).toEqual({ ping: 'pong' });
  });
});
