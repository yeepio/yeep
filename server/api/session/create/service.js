import addSeconds from 'date-fns/add_seconds';
import isBefore from 'date-fns/is_before';
import { ObjectId } from 'mongodb';
import {
  UserNotFoundError,
  InvalidUserPasswordError,
  UserDeactivatedError,
  AuthFactorNotFound,
  AuthFactorRequired,
  InvalidAuthFactor,
} from '../../../constants/errors';
import { getUserPermissions } from '../../user/info/service';
import { AUTHENTICATION, SESSION_REFRESH } from '../../../constants/tokenTypes';

export const defaultProjection = {
  permissions: false,
  profile: false,
};

const constructUserMatchQuery = (username, emailAddress) => {
  if (username) {
    return { username };
  }

  return {
    emails: { $elemMatch: { address: emailAddress } },
  };
};

/**
 * Verifies password and returns the designated user.
 * @param {Object} ctx
 * @property {Object} ctx.db
 * @param {Object} props
 * @property {string} [props.username]
 * @property {string} [props.emailAddress]
 * @property {string} props.password
 * @returns {Promise}
 */
export async function getUserAndVerifyPassword({ db }, { username, emailAddress, password }) {
  const UserModel = db.model('User');
  const PasswordModel = db.model('Password');
  const normalizedEmailAddress = emailAddress && UserModel.normalizeEmailAddress(emailAddress);

  // retrieve user from db
  const user = await UserModel.findOneWithAuthFactors(
    constructUserMatchQuery(username, normalizedEmailAddress)
  );

  // make sure user exists
  if (!user) {
    throw new UserNotFoundError(`User "${username || emailAddress}" not found`);
  }

  // make sure user is active
  if (!!user.deactivatedAt && isBefore(user.deactivatedAt, new Date())) {
    throw new UserDeactivatedError(`User "${username || emailAddress}" is deactivated`);
  }

  // retrieve password authentication factor
  const passwordAuthFactor = user.authFactors.find((e) => e.type === 'PASSWORD');

  // make sure password authentication factor exists
  if (!passwordAuthFactor) {
    throw new AuthFactorNotFound(
      `Password authentication factor not found for user "${username || emailAddress}"`
    );
  }

  // verify password
  const isPasswordVerified = await PasswordModel.verifyPassword(
    password,
    passwordAuthFactor.salt.buffer,
    passwordAuthFactor.iterationCount,
    passwordAuthFactor.password.buffer
  );

  if (!isPasswordVerified) {
    throw new InvalidUserPasswordError('Invalid user or password');
  }

  return {
    id: user._id.toHexString(),
    username: user.username,
    fullName: user.fullName,
    picture: user.picture,
    emails: user.emails,
    authFactors: user.authFactors,
  };
}

/**
 * Issues access + refresh token pair for the designated user.
 * @param {Object} ctx
 * @property {Object} ctx.db
 * @property {Object} ctx.jwt
 * @property {Object} ctx.config
 * @param {Object} props
 * @property {Object} props.user
 * @property {Object} [props.projection]
 * @return {Promise}
 */
export async function issueAccessAndRefreshTokens(ctx, { user, projection }) {
  const { db, jwt, config } = ctx;
  const TokenModel = db.model('Token');
  const UserModel = db.model('User');
  const now = new Date();

  // create authToken in db
  const secret = TokenModel.generateSecret({ length: 24 });
  const authToken = await TokenModel.create({
    secret,
    type: AUTHENTICATION,
    payload: {},
    user: ObjectId(user.id),
    expiresAt: addSeconds(now, config.accessToken.lifetimeInSeconds),
  });

  // set accessToken payload
  const payload = {
    user: {
      id: user.id,
    },
  };

  // decorate accessToken payload with user profile data
  if (projection.profile) {
    payload.user.username = user.username;
    payload.user.fullName = user.fullName;
    payload.user.picture = user.picture || undefined;
    payload.user.primaryEmail = UserModel.getPrimaryEmailAddress(user.emails);
  }

  // decorate accessToken payload with user permissions
  if (projection.permissions) {
    const permissions = await getUserPermissions(ctx, { userId: user.id });
    payload.user.permissions = permissions.map((e) => {
      return {
        ...e,
        resourceId: e.resourceId || undefined, // remove resourceId if unspecified to save bandwidth
      };
    });
  }

  const [accessToken, refreshToken] = await Promise.all([
    // sign accessToken
    jwt.sign(payload, {
      jwtid: authToken.secret,
      expiresIn: config.accessToken.lifetimeInSeconds,
    }),
    // create refreshToken in db
    TokenModel.create({
      secret: TokenModel.generateSecret({ length: 60 }),
      type: SESSION_REFRESH,
      payload: {
        accessTokenSecret: authToken.secret,
      },
      user: ObjectId(user.id),
      expiresAt: addSeconds(now, config.refreshToken.lifetimeInSeconds),
    }),
  ]);

  return {
    accessToken,
    refreshToken: refreshToken.secret,
  };
}

export async function verifyAuthFactor({ db }, { type, token, user }) {
  // retrieve auth factor by type
  const authFactor = user.authFactors.find((authFactor) => authFactor.type === type);

  // ensure auth factor exists
  if (!authFactor) {
    throw new AuthFactorNotFound(`User ${user.id} has not activated ${type} authentication`);
  }

  // verify token
  switch (type) {
    case 'PASSWORD': {
      const isPasswordVerified = await db
        .model('Password')
        .verifyPassword(
          token,
          authFactor.salt.buffer,
          authFactor.iterationCount,
          authFactor.password.buffer
        );

      if (!isPasswordVerified) {
        throw new InvalidAuthFactor(`The supplied password cannot be verified`);
      }

      break;
    }
    case 'TOTP': {
      const isTokenVerified = await db.model('TOTP').verifyToken(token, authFactor.secret);

      if (!isTokenVerified) {
        throw new InvalidAuthFactor(`The supplied OTP token cannot be verified`);
      }

      break;
    }
    default:
      throw new InvalidAuthFactor(`Unknown authentication factor type "${type}"`);
  }
}

export default async function createSession(
  ctx,
  { username, emailAddress, password, projection = defaultProjection, secondaryAuthFactor }
) {
  // retrieve user + verify password
  const user = await getUserAndVerifyPassword(ctx, {
    username,
    emailAddress,
    password,
  });

  // check if user has enabled multi-factor authentication (MFA)
  if (user.authFactors.length > 1) {
    // ensure secondary auth factor has been specified
    if (!secondaryAuthFactor) {
      const availableAuthFactors = Array.from(
        user.authFactors.reduce((accumulator, authFactor) => {
          if (authFactor.type !== 'PASSWORD') {
            accumulator.add(authFactor.type);
          }
          return accumulator;
        }, new Set())
      );
      throw new AuthFactorRequired(
        `User "${username ||
          emailAddress}" has enabled MFA; please specify secondary authentication factor`,
        availableAuthFactors
      );
    }

    // verify secondary auth factor
    await verifyAuthFactor(ctx, {
      ...secondaryAuthFactor,
      user,
    });
  }

  // issue access + refresh tokens
  const { accessToken, refreshToken } = await issueAccessAndRefreshTokens(ctx, {
    user,
    projection,
  });

  return {
    accessToken,
    refreshToken,
  };
}
