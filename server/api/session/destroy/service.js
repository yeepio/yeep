import { InvalidAccessToken } from '../../../constants/errors';
import { AUTHENTICATION, SESSION_REFRESH } from '../../../constants/tokenTypes';

/**
 * Destroys the designated `accessToken` and (optionally) `refreshToken`, a.k.a sign-out.
 * @param {Object} ctx
 * @property {Object} ctx.db
 * @param {Object} props
 * @property {string} props.accessToken
 * @property {string} props.refreshToken
 * @returns {Promise}
 */
export default async function destroySession(ctx, props) {
  const { db, jwt } = ctx;
  const TokenModel = db.model('Token');

  // parse accessToken payload
  let accessTokenPayload;
  try {
    accessTokenPayload = await jwt.verify(props.accessToken, {
      ignoreExpiration: true,
    });
  } catch (err) {
    throw new InvalidAccessToken("Invalid access token; cannot verify it's authenticity");
  }

  if (props.refreshToken) {
    // retrieve refreshToken from db
    const refreshToken = await TokenModel.findOne({
      secret: props.refreshToken,
      type: SESSION_REFRESH,
    });

    // delete if it exists and is applicable to the accessToken
    if (refreshToken && refreshToken.payload.get('accessTokenSecret') === accessTokenPayload.jti) {
      await TokenModel.deleteOne({
        _id: refreshToken._id,
      });
    }
  }

  // delete accessToken
  const result = await TokenModel.deleteOne({
    secret: accessTokenPayload.jti,
    type: AUTHENTICATION,
  });
  return !!result.ok;
}
