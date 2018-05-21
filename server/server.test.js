/* eslint-env jest */

import server from './server';

describe('server', () => {
  test('performs setup/teardown without crashing', async () => {
    await server.setup();
    server.listen();
    server.close();
    await server.teardown();
  });
});
