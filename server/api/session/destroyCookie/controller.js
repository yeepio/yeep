import compose from 'koa-compose';
import Boom from 'boom';
import { decorateSession, isUserAuthenticated } from '../../../middleware/auth';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { destroySessionCookie } from './service';

async function handler(ctx) {
  const { response, cookies } = ctx;

  const isSessionCookieDestroyed = await destroySessionCookie(ctx, cookies.get('session'));

  if (!isSessionCookieDestroyed) {
    throw Boom.internal();
  }

  response.status = 200; // OK
  cookies.set('session', '', {
    expires: new Date(0),
    overwrite: true,
  });
}

export default compose([packJSONRPC, decorateSession(), isUserAuthenticated(), handler]);