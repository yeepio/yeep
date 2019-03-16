/* eslint-env jest */
import request from 'supertest';
import server from '../../../server';

describe('api/ping', () => {
  test('responds as expected', async () => {
    const res = await request(server).get('/api/ping');
    expect(res.status).toEqual(200);
    expect(res.type).toMatch(/json/);
    expect(res.body).toEqual({ ping: 'pong' });
  });
});
