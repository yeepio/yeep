import compose from 'koa-compose';
import isFunction from 'lodash/isFunction';
import { decorateSession, isUserAuthenticated } from '../../../middleware/auth';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { refreshSessionCookie } from './service';

async function handler(ctx) {
  const { request, response, config } = ctx;

  const { cookie, body, expiresAt } = await await refreshSessionCookie(ctx, {
    secret: request.session.token.id,
    userId: request.session.user.id,
  });

  ctx.cookies.set('session', cookie, {
    domain: isFunction(config.cookie.domain) ? config.cookie.domain(request) : config.cookie.domain,
    path: isFunction(config.cookie.path) ? config.cookie.path(request) : config.cookie.path,
    httpOnly: isFunction(config.cookie.httpOnly)
      ? config.cookie.httpOnly(request)
      : config.cookie.httpOnly,
    secure: isFunction(config.cookie.secure) ? config.cookie.secure(request) : config.cookie.secure,
    expires: expiresAt,
    overwrite: true,
  });

  response.status = 200; // OK
  response.body = body;
}

export default compose([packJSONRPC, decorateSession(), isUserAuthenticated(), handler]);
