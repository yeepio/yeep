import { ObjectId } from 'mongodb';
import { isBefore } from 'date-fns';
import {
  TokenNotFoundError,
  InvalidTOTPToken,
  DuplicateAuthFactor,
  AuthFactorNotFound,
  UserNotFoundError,
  UserDeactivatedError,
  AuthFactorRequired,
} from '../../../constants/errors';
import { verifyAuthFactor } from '../../session/create/service';

export const ejectTOTPAuthFactor = async (
  ctx,
  { userId, secondaryAuthFactor, isMFARequired = false }
) => {
  const { db } = ctx;
  const TOTPModel = db.model('TOTP');
  const UserModel = db.model('User');

  // retrieve user from db
  const user = await UserModel.findOneWithAuthFactors({ _id: ObjectId(userId) });

  // make sure user exists
  if (!user) {
    throw new UserNotFoundError(`User ${userId} not found`);
  }

  // make sure user is active
  if (!!user.deactivatedAt && isBefore(user.deactivatedAt, new Date())) {
    throw new UserDeactivatedError(`User ${userId} is deactivated`);
  }

  // ensure TOTP authentication factor exists
  if (!user.authFactors.some((e) => e.type === 'TOTP')) {
    throw new AuthFactorNotFound(`User ${userId} is not enrolled to TOTP authentication`);
  }

  // check if MFA is required
  if (isMFARequired) {
    // ensure secondary auth factor has been specified
    if (!secondaryAuthFactor) {
      const availableAuthFactors = Array.from(
        user.authFactors.reduce((accumulator, authFactor) => {
          accumulator.add(authFactor.type);
          return accumulator;
        }, new Set())
      );

      throw new AuthFactorRequired(
        `User ${userId} has enabled MFA; please specify secondary authentication factor`,
        availableAuthFactors
      );
    }

    // verify secondary auth factor
    await verifyAuthFactor(ctx, {
      ...secondaryAuthFactor,
      user,
    });
  }

  // delete TOTP authentication factor
  await TOTPModel.deleteOne({
    user: ObjectId(userId),
  });
};
