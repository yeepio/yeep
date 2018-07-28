async function deleteUser(db, user) {
  const UserModel = db.model('User');
  const result = await UserModel.deleteOne({ _id: user.id });
  return !!result.ok;
}

export default deleteUser;
