import { AUTHENTICATION } from '../../../constants/tokenTypes';
import jwt from '../../../utils/jwt';
import { InvalidAccessToken } from '../../../constants/errors';

export async function destroySessionToken(ctx, { token }) {
  const { db, config } = ctx;
  const TokenModel = db.model('Token');

  // verify JWT authenticity
  let payload;
  try {
    payload = await jwt.verifyAsync(token, config.session.bearer.secret, {
      ignoreExpiration: true,
      issuer: config.name,
      algorithm: 'HS512',
    });
  } catch (err) {
    throw InvalidAccessToken('Invalid authorization token');
  }

  // ensure JWT has not expired
  const now = new Date();
  if (payload.exp * 1000 < now.getTime()) {
    throw InvalidAccessToken('Authorization token has already expired');
  }

  // delete authentication token from db
  const result = await TokenModel.deleteOne({
    secret: payload.jti,
    type: AUTHENTICATION,
  });

  return !!result.ok;
}
