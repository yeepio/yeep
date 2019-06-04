import { InvalidAccessToken } from '../../../constants/errors';
import { AUTHENTICATION } from '../../../constants/tokenTypes';
import jwt from '../../../utils/jwt';

export async function destroySessionCookie(ctx, { sessionCookie }) {
  const { db, config } = ctx;
  const TokenModel = db.model('Token');

  // parse session cookie payload
  let sessionCookiePayload;
  try {
    sessionCookiePayload = await jwt.verify(sessionCookie, config.cookie.secret, {
      ignoreExpiration: true,
    });
  } catch (err) {
    throw new InvalidAccessToken("Invalid session cookie; cannot verify it's authenticity");
  }

  // delete authentication token from db
  const result = await TokenModel.deleteOne({
    secret: sessionCookiePayload.jti,
    type: AUTHENTICATION,
  });

  return !!result.ok;
}
