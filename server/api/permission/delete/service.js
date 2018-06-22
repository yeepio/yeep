async function deletePermission(db, { id }) {
  const PermissionModel = db.model('Permission');
  const result = await PermissionModel.deleteOne({ _id: id });
  return !!result.ok;
}

export default deletePermission;
