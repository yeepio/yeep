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
import jwt, { omitJwtProps } from '../../../utils/jwt';

async function issueBearerJwtFromExchangeToken(ctx, exchangeToken) {
  const { config } = ctx;

  const token = await jwt.signAsync(
    {
      ...exchangeToken.swapPayload,
      iat: Math.floor(exchangeToken.createdAt.getTime() / 1000),
      exp: Math.floor(exchangeToken.swapExpiresAt.getTime() / 1000),
    },
    config.session.bearer.secret,
    {
      jwtid: exchangeToken.swapSecret,
      issuer: config.name,
      algorithm: 'HS512',
    }
  );

  return {
    token,
    expiresAt: exchangeToken.swapExpiresAt,
  };
}

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
  const AuthenticationTokenModel = db.model('AuthenticationToken');
  const ExchangeTokenModel = db.model('ExchangeToken');
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
  const authToken = await AuthenticationTokenModel.findOne({ secret: payload.jti });

  // ensure authentication token exists
  if (!authToken) {
    // check if exchange token exists
    const exchangeToken = await ExchangeTokenModel.findOne({ secret: payload.jti });

    if (exchangeToken) {
      console.log('exit ab');
      return issueBearerJwtFromExchangeToken(ctx, exchangeToken);
    }

    throw new TokenNotFoundError('Authentication token does not exist or has already expired');
  }

  // retrieve user by ID
  const user = await UserModel.findOne({ _id: ObjectId(payload.user.id) });

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
  const secret = AuthenticationTokenModel.generateSecret({ length: 24 });
  let expiresAt = addSeconds(now, config.session.bearer.expiresInSeconds);
  if (expiresAt > authToken.expiresAt) {
    expiresAt = authToken.expiresAt;
  }
  const token = await jwt.signAsync(
    {
      user: payload.user,
      iat: Math.floor(now.getTime() / 1000),
      exp: Math.floor(expiresAt.getTime() / 1000),
    },
    config.session.bearer.secret,
    {
      jwtid: secret,
      issuer: config.name,
      algorithm: 'HS512',
    }
  );

  // update database
  const session = await db.startSession();
  session.startTransaction();
  try {
    // create new authentication token
    await AuthenticationTokenModel.create(
      [
        {
          secret,
          user: user._id,
          createsAt: now,
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
    await ExchangeTokenModel.create(
      [
        {
          secret: authToken.secret,
          user: user._id,
          swapSecret: secret,
          swapPayload: omitJwtProps(payload),
          swapExpiresAt: expiresAt,
          createsAt: now,
          expiresAt: exchangeExpiresAt,
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
      const exchangeToken = await ExchangeTokenModel.findOne({ secret: payload.jti });

      if (exchangeToken) {
        return issueBearerJwtFromExchangeToken(ctx, exchangeToken);
      }
    }

    throw err;
  } finally {
    session.endSession();
  }

  console.log(token);
  return { token, expiresAt };
}
