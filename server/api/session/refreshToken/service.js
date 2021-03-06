import { ObjectId } from 'mongodb';
import has from 'lodash/has';
import isBefore from 'date-fns/is_before';
import {
  UserNotFoundError,
  UserDeactivatedError,
  TokenNotFoundError,
  InvalidAccessToken,
} from '../../../constants/errors';
import jwt from '../../../utils/jwt';
import addSecondsWithCap from '../../../utils/addSecondsWithCap';
import { getUserPermissions } from '../../user/info/service';

export async function verifyBearerJWT(ctx, { token }) {
  const { config } = ctx;

  // parse token payload
  let payload;
  try {
    payload = await jwt.verifyAsync(token, config.session.bearer.secret, {
      ignoreExpiration: true,
      issuer: config.name,
      algorithm: 'HS512',
    });
  } catch (err) {
    throw new InvalidAccessToken('Invalid session token; cannot be verified');
  }

  // ensure payload contains user.id prop
  if (!has(payload, ['user', 'id'])) {
    throw new InvalidAccessToken(
      'Invalid session token; expected `user.id` as payload but found none'
    );
  }

  return payload;
}

export function deriveProjection(payload) {
  return {
    profile: has(payload, ['user', 'fullName']),
    permissions: has(payload, ['user', 'permissions']),
  };
}

export async function refreshSession(ctx, { secret, userId, projection }) {
  const { db } = ctx;
  const AuthenticationTokenModel = db.model('AuthenticationToken');
  const ExchangeTokenModel = db.model('ExchangeToken');
  const UserModel = db.model('User');

  // retrieve authentication token from db
  const authToken = await AuthenticationTokenModel.findOne({ secret });

  // ensure authentication token exists
  if (!authToken) {
    // check if exchange token exists
    const exchangeToken = await ExchangeTokenModel.findOne({ secret });

    if (exchangeToken) {
      return exchangeToken.session;
    }

    throw new TokenNotFoundError('Authentication token does not exist or has already expired');
  }

  // retrieve user by ID
  const user = await UserModel.findOne({ _id: ObjectId(userId) });

  // ensure user exists
  if (!user) {
    throw new UserNotFoundError(`User ${userId} not found`);
  }

  // ensure user is active
  if (!!user.deactivatedAt && isBefore(user.deactivatedAt, new Date())) {
    throw new UserDeactivatedError(`User ${userId} is deactivated`);
  }

  // create next session obj
  const now = new Date();
  const nextSecret = AuthenticationTokenModel.generateSecret({ length: 24 });
  const nextSession = {
    secret: nextSecret,
    user: {
      id: user.id,
    },
    createdAt: now,
    expiresAt: authToken.expiresAt, // same as previous authToken
  };

  // decorate session obj with user profile data
  if (projection.profile) {
    nextSession.user.username = user.username;
    nextSession.user.fullName = user.fullName;
    nextSession.user.picture = user.picture || undefined;
    nextSession.user.primaryEmail = UserModel.getPrimaryEmailAddress(user.emails);
  }

  // decorate session obj with user permissions
  if (projection.permissions) {
    const permissions = await getUserPermissions(ctx, { userId: user.id });
    nextSession.user.permissions = permissions.map((e) => {
      return {
        ...e,
        resourceId: e.resourceId || undefined, // remove resourceId if unspecified to save bandwidth
      };
    });
  }

  // update database
  const session = await db.startSession();
  session.startTransaction();
  try {
    // create new authentication token
    await AuthenticationTokenModel.create(
      [
        {
          secret: nextSecret,
          user: user._id,
          createdAt: now,
          expiresAt: authToken.expiresAt, // same as previous authToken
        },
      ],
      {
        session,
      }
    );

    // set exchange token
    await ExchangeTokenModel.create(
      [
        {
          secret: authToken.secret,
          user: user._id,
          session: nextSession,
          createdAt: now,
          expiresAt: addSecondsWithCap(now, 60, authToken.expiresAt),
        },
      ],
      {
        session,
      }
    );

    // delete previous authentication token
    await AuthenticationTokenModel.deleteOne(
      {
        _id: authToken._id,
      },
      {
        session,
      }
    );

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();

    if (err.code === 112) {
      // check if exchange token exists
      const exchangeToken = await ExchangeTokenModel.findOne({ secret: authToken.secret });

      if (exchangeToken) {
        return exchangeToken.session;
      }
    }

    throw err;
  } finally {
    session.endSession();
  }

  return nextSession;
}
