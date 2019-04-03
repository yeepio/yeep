import randomstring from 'randomstring';
import QRCode from 'qrcode';

export const enrollSOTPFactor = async ({ db }, { key }) => {
  const CredentialsModel = db.model('Credentials');

  return CredentialsModel.getSOTP(key);
};
