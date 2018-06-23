async function deletePermissionAssignment(db, { id }) {
  const PermissionAssignmentModel = db.model('PermissionAssignment');
  const result = await PermissionAssignmentModel.deleteOne({ _id: id });
  return !!result.ok;
}

export default deletePermissionAssignment;
