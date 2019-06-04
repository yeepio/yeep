import addSeconds from 'date-fns/add_seconds';
import { ObjectId } from 'mongodb';
import jwt from '../../../utils/jwt';
import { AuthFactorRequired } from '../../../constants/errors';
import { getUserPermissions } from '../../user/info/service';
import { AUTHENTICATION } from '../../../constants/tokenTypes';
import { PASSWORD } from '../../../constants/authFactorTypes';
import { getUserAndVerifyPassword, verifyAuthFactor } from '../create/service';

export const defaultProjection = {
  permissions: false,
  profile: false,
};

export async function setSessionCookie(
  ctx,
  { username, emailAddress, password, projection = defaultProjection, secondaryAuthFactor }
) {
  const { db, config } = ctx;
  const TokenModel = db.model('Token');
  const UserModel = db.model('User');

  // retrieve user + verify password
  const user = await getUserAndVerifyPassword(ctx, {
    username,
    emailAddress,
    password,
  });

  // check if user has enabled multi-factor authentication (MFA)
  if (user.authFactors.length > 1) {
    // ensure secondary auth factor was specified
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
  const secret = TokenModel.generateSecret({ length: 24 });
  const now = new Date();
  const expiresAt = addSeconds(now, config.cookie.lifetimeInSeconds);
  const authToken = await TokenModel.create({
    secret,
    type: AUTHENTICATION,
    payload: {},
    user: ObjectId(user.id),
    expiresAt,
  });

  // create body
  const body = {
    user: {
      id: user.id,
    },
  };

  // compile cookie as JWT token
  const renewableAt = addSeconds(
    now,
    config.cookie.isAutoRenewEnabled
      ? config.cookie.renewIntervalInSeconds
      : config.cookie.lifetimeInSeconds
  );
  const cookie = await jwt.signAsync(
    {
      ...body,
      iat: Math.floor(now.getTime() / 1000),
      exp: Math.floor(renewableAt.getTime() / 1000),
    },
    config.cookie.secret,
    {
      jwtid: authToken.secret,
      issuer: config.name,
      algorithm: 'HS512',
    }
  );

  // decorate body with user profile data
  if (projection.profile) {
    body.user.username = user.username;
    body.user.fullName = user.fullName;
    body.user.picture = user.picture || undefined;
    body.user.primaryEmail = UserModel.getPrimaryEmailAddress(user.emails);
  }

  // decorate body with user permissions
  if (projection.permissions) {
    const permissions = await getUserPermissions(ctx, { userId: user.id });
    body.user.permissions = permissions.map((e) => {
      return {
        ...e,
        resourceId: e.resourceId || undefined, // remove resourceId if unspecified to save bandwidth
      };
    });
  }

  return {
    cookie,
    body,
    expiresAt,
  };
}
