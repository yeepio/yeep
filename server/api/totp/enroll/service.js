import { ObjectId } from 'mongodb';
import QRCode from 'qrcode';
import { addSeconds } from 'date-fns';
import { DuplicateAuthFactor } from '../../../constants/errors';

const TOKEN_LIFETIME_IN_SECONDS = 15 * 60; // 15 mins

export const enrollTOTPAuthFactor = async ({ db, config }, { userId }) => {
  const TokenModel = db.model('Token');
  const TOTPModel = db.model('TOTP');

  // ensure user has not already activated TOTP authentication factor
  const totpCount = await TOTPModel.countDocuments({
    user: ObjectId(userId),
  });

  if (totpCount !== 0) {
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
