import { ObjectId } from 'mongodb';
import has from 'lodash/has';
import isBefore from 'date-fns/is_before';
import {
  UserNotFoundError,
  UserDeactivatedError,
  TokenNotFoundError,
  InvalidAccessToken,
  InvalidRefreshToken,
} from '../../../constants/errors';
import { issueAccessAndRefreshTokens } from '../create/service';

/**
 * Refreshes the supplied accessToken.
 * @param {Object} ctx
 * @param {Object} props
 * @property {string} props.accessToken
 * @property {string} props.refreshToken
 * @returns {Promise}
 */
export default async function refreshSessionToken(ctx, props) {
  const { db, jwt } = ctx;
  const TokenModel = db.model('Token');
  const UserModel = db.model('User');

  // retrieve refreshToken from db
  const refreshToken = await TokenModel.findOne({
    secret: props.refreshToken,
    type: 'SESSION_REFRESH',
  });

  // ensure refreshToken exists
  if (!refreshToken) {
    throw new TokenNotFoundError('Refresh token does not exist or has already expired');
  }

  // parse accessToken payload
  let accessTokenPayload;
  try {
    accessTokenPayload = await jwt.verify(props.accessToken, {
      ignoreExpiration: true,
    });
  } catch (err) {
    throw new InvalidAccessToken('Invalid access token; cannot be verified');
  }

  // ensure accessToken contains user.id prop
  if (!has(accessTokenPayload, ['user', 'id'])) {
    throw new InvalidAccessToken(
      'Invalid access token; expected `user.id` as payload but found none'
    );
  }

  // ensure refreshToken is applicable to the designated accessToken
  if (refreshToken.payload.get('accessTokenSecret') !== accessTokenPayload.jti) {
    throw new InvalidRefreshToken(
      'Invalid refresh token; not applicable to the supplied access token'
    );
  }

  await Promise.all([
    // redeem refreshToken - it can only be used once
    TokenModel.deleteOne({
      secret: props.refreshToken,
      type: 'SESSION_REFRESH',
    }),
    // redeem accessToken - client should use the new accessToken from now on
    TokenModel.deleteOne({
      secret: accessTokenPayload.jti,
      type: 'AUTHENTICATION',
    }),
  ]);

  // retrieve user by ID as specified in the accessToken
  const user = await UserModel.findOne({
    _id: ObjectId(accessTokenPayload.user.id),
  });

  // make sure user exists
  if (!user) {
    throw new UserNotFoundError(`User ${accessTokenPayload.user.id} not found`);
  }

  // make sure user is active
  if (!!user.deactivatedAt && isBefore(user.deactivatedAt, new Date())) {
    throw new UserDeactivatedError(`User ${accessTokenPayload.user.id} is deactivated`);
  }

  return issueAccessAndRefreshTokens(ctx, {
    user: {
      ...user,
      id: user._id.toHexString(),
    },
    scope: {
      profile: has(accessTokenPayload, ['user', 'fullName']),
      permissions: has(accessTokenPayload, ['user', 'permissions']),
    },
  });
}
