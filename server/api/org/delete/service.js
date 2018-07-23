async function deleteOrg(db, { id, adminId }) {
  const OrgModel = db.model('Org');
  const UserModel = db.model('User');
  const PermissionAssignmentModel = db.model('PermissionAssignment');

  await PermissionAssignmentModel.deleteMany({ user: adminId, org: id });
  await UserModel.updateOne({ _id: adminId }, { $pull: { orgs: id } });
  const result = await OrgModel.deleteOne({ _id: id });

  return !!result.ok;
}

export default deleteOrg;
