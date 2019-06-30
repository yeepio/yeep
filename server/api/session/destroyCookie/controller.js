import compose from 'koa-compose';
import Boom from 'boom';
import { decorateSession, isUserAuthenticated, isSessionCookie } from '../../../middleware/auth';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { destroySession } from '../destroyToken/service';

async function handler(ctx) {
  const { response, request, cookies } = ctx;

  const isSessionCookieDestroyed = await destroySession(ctx, {
    secret: request.session.token.secret,
  });

  if (!isSessionCookieDestroyed) {
    throw Boom.internal();
  }

  response.status = 200; // OK
  cookies.set('session', '', {
    expires: new Date(0),
    overwrite: true,
  });
}

export default compose([
  packJSONRPC,
  decorateSession(),
  isSessionCookie,
  isUserAuthenticated(),
  handler,
]);
