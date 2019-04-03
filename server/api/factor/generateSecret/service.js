import randomstring from 'randomstring';
import QRCode from 'qrcode';

export const generateSOTPSecret = async ({ config }, { userId }) => {
  // TODO: Replace randomstring.generate with async version
  // @see https://github.com/klughammer/node-randomstring/issues/28
  // generate secret key
  const key = randomstring.generate({
    length: 32,
    readable: false,
    charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567', // i.e. Base32 characters
  });

  // TODO: store secret key in token collection

  // construct key URI
  // @see https://github.com/google/google-authenticator/wiki/Key-Uri-Format
  const keyUri = `otpauth://totp/${encodeURIComponent(
    config.name
  )}:${userId}?secret=${key}&issuer=${encodeURIComponent(config.name)}`;

  // render qrcode
  const qrcode = await QRCode.toDataURL(keyUri);

  return {
    type: 'SOTP',
    key,
    qrcode,
  };
};
