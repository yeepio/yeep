async function destroySession(db, { id }) {
  const TokenModel = db.model('Token');
  const result = await TokenModel.deleteOne({ _id: id });
  return !!result.ok;
}

export default destroySession;
