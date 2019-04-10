import { ObjectId } from 'mongodb';
import QRCode from 'qrcode';
import { addSeconds } from 'date-fns';

const TOKEN_LIFETIME_IN_SECONDS = 15 * 60; // 15 mins

export const generateTOTPSecret = async ({ db, config }, { userId }) => {
  const TokenModel = db.model('Token');
  const TOTPModel = db.model('TOTP');

  // generate secret
  const secret = TOTPModel.generateSecret();

  // create totp_enroll token
  await TokenModel.create({
    secret,
    type: 'TOTP_SECRET',
    user: ObjectId(userId),
    org: null,
    expiresAt: addSeconds(new Date(), TOKEN_LIFETIME_IN_SECONDS),
  });

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
};
