import addSeconds from 'date-fns/add_seconds';
import isBefore from 'date-fns/is_before';
import {
  UserNotFoundError,
  InvalidUserPasswordError,
  UserDeactivatedError,
  AuthFactorNotFound,
  AuthFactorRequired,
  InvalidAuthFactor,
} from '../../../constants/errors';
import { getUserPermissions } from '../../user/info/service';
import jwt from '../../../utils/jwt';
import { PASSWORD, TOTP } from '../../../constants/authFactorTypes';
import addSecondsWithCap from '../../../utils/addSecondsWithCap';

export const defaultProjection = {
  permissions: false,
  profile: false,
};

function constructUserMatchQuery(username, emailAddress) {
  if (username) {
    return { username };
  }

  return {
    emails: { $elemMatch: { address: emailAddress } },
  };
}

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
export async function getUserAndVerifyPassword(ctx, { username, emailAddress, password }) {
  const { db } = ctx;
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
  const passwordAuthFactor = user.authFactors.find((e) => e.type === PASSWORD);

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

export async function verifyAuthFactor({ db }, { type, token, user }) {
  // retrieve auth factor by type
  const authFactor = user.authFactors.find((authFactor) => authFactor.type === type);

  // ensure auth factor exists
  if (!authFactor) {
    throw new AuthFactorNotFound(`User ${user.id} has not activated ${type} authentication`);
  }

  // verify token
  switch (type) {
    case PASSWORD: {
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
    case TOTP: {
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

export async function signBearerJWT(ctx, session) {
  const { config } = ctx;

  const expiresAt = addSecondsWithCap(
    session.createdAt,
    config.session.bearer.expiresInSeconds,
    session.expiresAt
  );

  const token = await jwt.signAsync(
    {
      user: session.user,
      iat: Math.floor(session.createdAt.getTime() / 1000),
      exp: Math.floor(expiresAt.getTime() / 1000),
    },
    config.session.bearer.secret,
    {
      jwtid: session.secret,
      issuer: config.name,
      algorithm: 'HS512',
    }
  );

  return token;
}

export async function createSession(
  ctx,
  { username, emailAddress, password, projection = defaultProjection, secondaryAuthFactor }
) {
  const { db, config } = ctx;
  const AuthenticationTokenModel = db.model('AuthenticationToken');
  const UserModel = db.model('User');

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
          if (authFactor.type !== PASSWORD) {
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

  // create authToken in db
  const now = new Date();
  const secret = AuthenticationTokenModel.generateSecret({ length: 24 });
  const authToken = await AuthenticationTokenModel.create({
    secret,
    user: user._id,
    createdAt: now,
    expiresAt: addSeconds(now, config.session.lifetimeInSeconds),
  });

  // create session obj
  const session = {
    secret: authToken.secret,
    user: {
      id: user.id,
    },
    createdAt: now,
    expiresAt: authToken.expiresAt,
  };

  // decorate session obj with user profile data
  if (projection.profile) {
    session.user.username = user.username;
    session.user.fullName = user.fullName;
    session.user.picture = user.picture || undefined;
    session.user.primaryEmail = UserModel.getPrimaryEmailAddress(user.emails);
  }

  // decorate session obj with user permissions
  if (projection.permissions) {
    const permissions = await getUserPermissions(ctx, { userId: user.id });
    session.user.permissions = permissions.map((e) => {
      return {
        ...e,
        resourceId: e.resourceId || undefined, // remove resourceId if unspecified to save bandwidth
      };
    });
  }

  return session;
}
