import { ObjectId } from 'mongodb';
import addSeconds from 'date-fns/add_seconds';
import isBefore from 'date-fns/is_before';
import {
  UserNotFoundError,
  UserDeactivatedError,
  TokenNotFoundError,
} from '../../../constants/errors';
import { AUTHENTICATION } from '../../../constants/tokenTypes';
import jwt from '../../../utils/jwt';

export async function refreshSessionCookie(ctx, { secret, userId }) {
  const { db, config } = ctx;
  const TokenModel = db.model('Token');
  const UserModel = db.model('User');

  // retrieve authentication token from db
  const authToken = await TokenModel.findOne({
    secret,
    type: AUTHENTICATION,
  });

  // ensure authentication token exists
  if (!authToken) {
    throw new TokenNotFoundError('Authentication token does not exist or has already expired');
  }

  // retrieve user by ID
  const user = await UserModel.findOne({
    _id: ObjectId(userId),
  });

  // ensure user exists
  if (!user) {
    throw new UserNotFoundError(`User ${userId} not found`);
  }

  // ensure user is active
  if (!!user.deactivatedAt && isBefore(user.deactivatedAt, new Date())) {
    throw new UserDeactivatedError(`User ${userId} is deactivated`);
  }

  // create body
  const body = {
    user: {
      id: user.id,
    },
  };

  // sign new cookie JWT
  const now = new Date();
  let exp = addSeconds(
    now,
    config.cookie.isAutoRenewEnabled
      ? config.cookie.renewIntervalInSeconds
      : config.cookie.lifetimeInSeconds
  );
  if (exp > authToken.expiresAt) {
    exp = authToken.expiresAt;
  }
  const cookie = await jwt.signAsync(
    {
      ...body,
      iat: Math.floor(now.getTime() / 1000),
      exp: Math.floor(exp.getTime() / 1000),
    },
    config.cookie.secret,
    {
      jwtid: secret,
      issuer: config.name,
      algorithm: 'HS512',
    }
  );

  return { cookie, body, expiresAt: authToken.expiresAt };
}
