async function deleteUser(db, { id }) {
  const UserModel = db.model('User');
  const result = await UserModel.deleteOne({ _id: id });
  return !!result.ok;
}

export default deleteUser;
