import { ObjectId } from 'mongodb';
import addSeconds from 'date-fns/add_seconds';
import isBefore from 'date-fns/is_before';
import {
  UserNotFoundError,
  UserDeactivatedError,
  TokenNotFoundError,
} from '../../../constants/errors';
import { AUTHENTICATION, EXCHANGE } from '../../../constants/tokenTypes';
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
    // check if exchange token exists
    const exchangeToken = await TokenModel.findOne({
      secret: payload.jti,
      type: EXCHANGE,
    });

    if (exchangeToken) {
      return exchangeToken.payload.toJSON();
    }

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

  // create payload obj
  const payload = {
    user: {
      id: user.id,
    },
  };

  // sign new JWT
  const now = new Date();
  const nextSecret = TokenModel.generateSecret({ length: 24 });
  let expiresAt = addSeconds(now, config.session.cookie.expiresInSeconds);
  if (expiresAt > authToken.expiresAt) {
    expiresAt = authToken.expiresAt;
  }
  const cookie = await jwt.signAsync(
    {
      ...payload,
      iat: Math.floor(now.getTime() / 1000),
      exp: Math.floor(expiresAt.getTime() / 1000),
    },
    config.session.cookie.secret,
    {
      jwtid: nextSecret,
      issuer: config.name,
      algorithm: 'HS512',
    }
  );

  // update database
  const session = await db.startSession();
  session.startTransaction();
  try {
    // create new authentication token
    await TokenModel.create(
      [
        {
          secret: nextSecret,
          type: AUTHENTICATION,
          payload: {},
          user: user._id,
          expiresAt: authToken.expiresAt, // same as previous authToken
        },
      ],
      {
        session,
      }
    );

    // set exchange token
    let exchangeExpiresAt = addSeconds(now, 60);
    if (exchangeExpiresAt > authToken.expiresAt) {
      exchangeExpiresAt = authToken.expiresAt;
    }
    await TokenModel.create(
      [
        {
          secret,
          type: EXCHANGE,
          payload: {
            cookie,
            payload,
            expiresAt: authToken.expiresAt,
          },
          user: user._id,
          expiresAt: exchangeExpiresAt,
        },
      ],
      {
        session,
      }
    );

    // delete previous authentication token
    await TokenModel.deleteOne(
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
      const exchangeToken = await TokenModel.findOne({
        secret,
        type: EXCHANGE,
      });

      if (exchangeToken) {
        return exchangeToken.payload.toJSON();
      }
    }

    throw err;
  } finally {
    session.endSession();
  }

  return {
    cookie,
    payload,
    expiresAt: authToken.expiresAt,
  };
}
