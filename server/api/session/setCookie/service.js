import jwt from '../../../utils/jwt';
import addSecondsWithCap from '../../../utils/addSecondsWithCap';

export async function signCookieJWT(ctx, session) {
  const { config } = ctx;

  const expiresAt = addSecondsWithCap(
    session.createdAt,
    config.session.cookie.expiresInSeconds,
    session.expiresAt
  );

  const token = await jwt.signAsync(
    {
      user: session.user,
      iat: Math.floor(session.createdAt.getTime() / 1000),
      exp: Math.floor(expiresAt.getTime() / 1000),
    },
    config.session.cookie.secret,
    {
      jwtid: session.secret,
      issuer: config.name,
      algorithm: 'HS512',
    }
  );

  return token;
}
