import { ObjectId } from 'mongodb';
import {
  TokenNotFoundError,
  InvalidTOTPToken,
  DuplicateAuthFactor,
} from '../../../constants/errors';

export const createTOTPAuthFactor = async ({ db }, { secret, token, userId }) => {
  const TokenModel = db.model('Token');
  const TOTPModel = db.model('TOTP');

  // acquire token from db
  const tokenRecord = await TokenModel.findOne({
    secret,
    type: 'TOTP_SECRET',
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
