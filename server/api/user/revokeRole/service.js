import { ObjectId } from 'mongodb';
import { RoleAssignmentNotFoundError } from '../../../constants/errors';

async function deleteRoleAssignment(db, { id }) {
  const RoleAssignmentModel = db.model('RoleAssignment');
  const result = await RoleAssignmentModel.deleteOne({ _id: ObjectId(id) });
  return !!result.ok;
}

async function getRoleAssignment(db, { id }) {
  const RoleAssignmentModel = db.model('RoleAssignment');

  // ensure role assignment exists
  const roleAssignment = await RoleAssignmentModel.findOne({ _id: ObjectId(id) });

  if (!roleAssignment) {
    throw new RoleAssignmentNotFoundError(`RoleAssignment ${id} does not exist`);
  }

  return {
    id: roleAssignment._id.toHexString(),
    userId: roleAssignment.user.toHexString(),
    roleId: roleAssignment.role.toHexString(),
    orgId: roleAssignment.org ? roleAssignment.org.toHexString() : undefined,
    resourceId: roleAssignment.resource,
  };
}

export default deleteRoleAssignment;
export { getRoleAssignment };
