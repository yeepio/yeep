/* eslint-env jest */

import server from './server';

describe('server', () => {
  test('starts/stops without crashing', async () => {
    const info = await server.start();
    expect(info).toMatchObject({
      url: expect.any(String),
    });
    await server.stop();
  });
});
