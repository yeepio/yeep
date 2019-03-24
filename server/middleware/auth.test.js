/* eslint-env jest */
import server from '../server';
import config from '../../yeep.config';
import { decorateUserPermissions } from './auth';

describe('auth middleware', () => {
  let ctx;

  beforeAll(async () => {
    await server.setup(config);
    ctx = server.getAppContext();
  });

  afterAll(async () => {
    await server.teardown();
  });

  describe('decorateUserPermissions', () => {
    test('throws authorization error when user is not authorized', async () => {
      const authz = decorateUserPermissions();

      const next = jest.fn(() => Promise.resolve());
      const request = {};

      await expect(authz({ request, db: ctx.db }, next)).rejects.toMatchObject({
        code: 10012,
        message: 'Unable to authorize non-authenticated user',
      });
    });
  });
});
