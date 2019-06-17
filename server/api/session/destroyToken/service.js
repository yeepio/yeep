export async function destroySession(ctx, { secret }) {
  const { db } = ctx;
  const AuthenticationTokenModel = db.model('AuthenticationToken');

  // delete authentication token from db
  const result = await AuthenticationTokenModel.deleteOne({ secret });

  return !!result.ok;
}
