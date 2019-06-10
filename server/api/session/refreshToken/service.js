import { ObjectId } from 'mongodb';
import has from 'lodash/has';
import isBefore from 'date-fns/is_before';
import addSeconds from 'date-fns/add_seconds';
import {
  UserNotFoundError,
  UserDeactivatedError,
  TokenNotFoundError,
  InvalidAccessToken,
} from '../../../constants/errors';
import { issueAuthToken } from '../issueToken/service';
import { AUTHENTICATION } from '../../../constants/tokenTypes';
import jwt from '../../../utils/jwt';

/**
 * Refreshes the supplied accessToken.
 * @param {Object} ctx
 * @param {Object} props
 * @property {string} props.token
 * @property {string} props.refreshToken
 * @returns {Promise}
 */
export async function refreshSessionToken(ctx, props) {
  const { db, config } = ctx;
  const TokenModel = db.model('Token');
  const UserModel = db.model('User');

  // parse token payload
  let payload;
  try {
    payload = await jwt.verifyAsync(props.token, config.session.bearer.secret, {
      ignoreExpiration: true,
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

  // retrieve authentication token from db
  const authToken = await TokenModel.findOne({
    secret: payload.jti,
    type: AUTHENTICATION,
  });

  // ensure authentication token exists
  if (!authToken) {
    throw new TokenNotFoundError('Authentication token does not exist or has already expired');
  }

  // retrieve user by ID
  const user = await UserModel.findOne({
    _id: ObjectId(payload.user.id),
  });

  // ensure user exists
  if (!user) {
    throw new UserNotFoundError(`User ${payload.user.id} not found`);
  }

  // ensure user is active
  if (!!user.deactivatedAt && isBefore(user.deactivatedAt, new Date())) {
    throw new UserDeactivatedError(`User ${payload.user.id} is deactivated`);
  }

  // sign new JWT
  const now = new Date();
  let nextExpDate = addSeconds(now, config.session.bearer.expiresInSeconds);
  if (nextExpDate > authToken.expiresAt) {
    nextExpDate = authToken.expiresAt;
  }
  const token = await jwt.signAsync(
    {
      ...payload,
      iat: Math.floor(now.getTime() / 1000),
      exp: Math.floor(nextExpDate.getTime() / 1000),
    },
    config.session.bearer.secret
  );

  return { token, expiresAt: authToken.expiresAt };
}
