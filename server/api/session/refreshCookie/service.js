import has from 'lodash/has';
import { InvalidAccessToken } from '../../../constants/errors';
import jwt from '../../../utils/jwt';

export async function verifyCookieJWT(ctx, { token }) {
  const { config } = ctx;

  // parse token payload
  let payload;
  try {
    payload = await jwt.verifyAsync(token, config.session.cookie.secret, {
      ignoreExpiration: true,
      issuer: config.name,
      algorithm: 'HS512',
    });
  } catch (err) {
    throw new InvalidAccessToken('Invalid access token; cannot be verified');
  }

  // ensure payload contains user.id prop
  if (!has(payload, ['user', 'id'])) {
    throw new InvalidAccessToken(
      'Invalid session token; expected `user.id` as payload but found none'
    );
  }

  return payload;
}
