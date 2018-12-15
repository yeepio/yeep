/* eslint-env jest */

import server from './server';
import config from '../yeep.config';

describe('server', () => {
  test('performs setup/teardown without crashing', async () => {
    await server.setup(config);
    server.listen();
    server.close();
    await server.teardown();
  });
});
