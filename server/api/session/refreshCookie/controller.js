import compose from 'koa-compose';
import isFunction from 'lodash/isFunction';
import { decorateSession, isUserAuthenticated, isSessionCookie } from '../../../middleware/auth';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { deriveProjection, refreshSession } from '../refreshToken/service';
import { signCookieJWT } from '../setCookie/service';

async function handler(ctx) {
  const { request, response, config } = ctx;

  const session = await refreshSession(ctx, {
    secret: request.session.token.secret,
    userId: request.session.user.id,
    projection: deriveProjection(request.session.user),
  });
  const token = await signCookieJWT(ctx, session);

  ctx.cookies.set('session', token, {
    domain: isFunction(config.session.cookie.domain)
      ? config.session.cookie.domain(request)
      : config.session.cookie.domain,
    path: isFunction(config.session.cookie.path)
      ? config.session.cookie.path(request)
      : config.session.cookie.path,
    httpOnly: isFunction(config.session.cookie.httpOnly)
      ? config.session.cookie.httpOnly(request)
      : config.session.cookie.httpOnly,
    secure: isFunction(config.session.cookie.secure)
      ? config.session.cookie.secure(request)
      : config.session.cookie.secure,
    expires: session.expiresAt,
    overwrite: true,
  });

  response.status = 200; // OK
  response.body = session.payload;
}

export default compose([
  packJSONRPC,
  decorateSession(),
  isSessionCookie,
  isUserAuthenticated(),
  handler,
]);
