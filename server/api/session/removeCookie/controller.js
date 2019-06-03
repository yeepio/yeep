import compose from 'koa-compose';
import Boom from 'boom';
import { decorateSession, isUserAuthenticated } from '../../../middleware/auth';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { removeSessionCookie } from './service';

async function handler(ctx) {
  const { response, cookies } = ctx;

  const isSessionCookieRemoved = await removeSessionCookie(ctx, cookies.get('session'));

  if (!isSessionCookieRemoved) {
    throw Boom.internal();
  }

  response.status = 200; // OK
  cookies.set('session', '', {
    expires: new Date(0),
    overwrite: true,
  });
}

export default compose([packJSONRPC, decorateSession(), isUserAuthenticated(), handler]);
