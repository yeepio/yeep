import { ObjectId } from 'mongodb';
import QRCode from 'qrcode';
import { addSeconds, isBefore } from 'date-fns';
import {
  DuplicateAuthFactor,
  UserNotFoundError,
  UserDeactivatedError,
} from '../../../constants/errors';

const TOKEN_LIFETIME_IN_SECONDS = 15 * 60; // 15 mins

export const enrollTOTPAuthFactor = async ({ db, config }, { userId }) => {
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
    throw new DuplicateAuthFactor(`User ${userId} is already enrolled to TOTP authentication`);
  }

  // generate secret
  const secret = TOTPModel.generateSecret();

  // update db
  const session = await db.startSession();
  session.startTransaction();

  try {
    // delete previous in-flight totp_enroll tokens (if any)
    await TokenModel.deleteMany({
      type: 'TOTP_ENROLL',
      user: ObjectId(userId),
    });

    // create new totp_enroll token
    await TokenModel.create({
      secret,
      type: 'TOTP_ENROLL',
      user: ObjectId(userId),
      org: null,
      expiresAt: addSeconds(new Date(), TOKEN_LIFETIME_IN_SECONDS),
    });

    await session.commitTransaction();

    // construct key URI
    // @see https://github.com/google/google-authenticator/wiki/Key-Uri-Format
    const keyUri = `otpauth://totp/${encodeURIComponent(
      config.name
    )}:${userId}?secret=${secret}&issuer=${encodeURIComponent(config.name)}`;

    // render qrcode
    const qrcode = await QRCode.toDataURL(keyUri);

    return {
      secret,
      qrcode,
    };
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
