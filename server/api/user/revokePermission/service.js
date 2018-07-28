import { PermissionAssignmentNotFoundError } from '../../../constants/errors';

async function deletePermissionAssignment(db, { id }) {
  const PermissionAssignmentModel = db.model('PermissionAssignment');
  const result = await PermissionAssignmentModel.deleteOne({ _id: id });
  return !!result.ok;
}

async function getPermissionAssignment(db, { id }) {
  const PermissionAssignmentModel = db.model('PermissionAssignment');

  // ensure permission assignment exists
  const permissionAssignment = await PermissionAssignmentModel.findOne({ _id: id });

  if (!permissionAssignment) {
    throw new PermissionAssignmentNotFoundError('PermissionAssignment does not exist');
  }

  return {
    id: permissionAssignment.id, // as hex string
    userId: permissionAssignment.user.toHexString(),
    permissionId: permissionAssignment.permission.toHexString(),
    orgId: permissionAssignment.org ? permissionAssignment.org.toHexString() : undefined,
    resourceId: permissionAssignment.resource,
  };
}

export default deletePermissionAssignment;
export { getPermissionAssignment };
