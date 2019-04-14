import { ObjectId } from 'mongodb';
import { isBefore } from 'date-fns';
import {
  TokenNotFoundError,
  InvalidTOTPToken,
  DuplicateAuthFactor,
  UserNotFoundError,
  UserDeactivatedError,
} from '../../../constants/errors';

export const activateTOTPAuthFactor = async ({ db }, { secret, token, userId }) => {
  const UserModel = db.model('User');
  const TokenModel = db.model('Token');
  const TOTPModel = db.model('TOTP');

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

  // ensure user has not already activated TOTP authentication factor
  if (user.authFactors.some((e) => e.type === 'TOTP')) {
    throw new DuplicateAuthFactor(`User ${userId} has already activated TOTP authentication`);
  }

  // acquire token from db
  const tokenRecord = await TokenModel.findOne({
    secret,
    type: 'TOTP_ENROLL',
  });

  // ensure token exists
  if (!tokenRecord) {
    throw new TokenNotFoundError('Secret key does not exist or has already expired');
  }

  // ensure token is associated with the designated user
  if (!tokenRecord.user.equals(userId)) {
    // TODO: Handle potential security compromise by communicating with the admin or user
    throw new TokenNotFoundError('Secret key does not exist or has already expired');
  }

  // verify token
  if (!TOTPModel.verifyToken(token, secret)) {
    throw new InvalidTOTPToken('TOTP token cannot be verified');
  }

  // update db
  const session = await db.startSession();
  session.startTransaction();

  try {
    // redeem token, i.e. delete from db
    await TokenModel.deleteOne({ _id: tokenRecord._id });

    // register TOTP Auth Factor for the designated user
    await TOTPModel.create({
      user: ObjectId(userId),
      secret,
    });

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();

    if (err.code === 11000) {
      throw new DuplicateAuthFactor(`User ${userId} is already enrolled to TOTP authentication`);
    }
    throw err;
  } finally {
    session.endSession();
  }
};
