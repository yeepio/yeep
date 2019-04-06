export const enrollSOTPFactor = async ({ db }, { key }) => {
  const TOTPModel = db.model('TOTP');

  return TOTPModel.getToken(key);
};
