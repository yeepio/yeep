import { AUTHENTICATION } from '../../../constants/tokenTypes';

export async function destroySessionCookie(ctx, { secret }) {
  const { db } = ctx;
  const TokenModel = db.model('Token');

  // delete authentication token from db
  const result = await TokenModel.deleteOne({
    secret,
    type: AUTHENTICATION,
  });

  return !!result.ok;
}
