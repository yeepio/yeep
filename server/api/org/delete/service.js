async function deleteOrg(db, { id, adminId }) {
  const OrgModel = db.model('Org');
  const UserModel = db.model('User');
  const PermissionAssignmentModel = db.model('PermissionAssignment');

  const session = await db.startSession();
  session.startTransaction();

  try {
    await PermissionAssignmentModel.deleteMany({ user: adminId, org: id });
    await UserModel.updateOne({ _id: adminId }, { $pull: { orgs: id } });
    const result = await OrgModel.deleteOne({ _id: id });
    await session.commitTransaction();
    return !!result.ok;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

export default deleteOrg;
