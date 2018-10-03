import { ObjectId } from 'mongodb';
import {
  PermissionAssignmentNotFoundError,
  UserNotFoundError,
  OrgNotFoundError,
  OrgMembershipNotFoundError,
} from '../../../constants/errors';

const existsPermissionAssignment = (permissionAssignments, { id, resourceId }) => {
  return permissionAssignments.some((permissionAssignment) => {
    return permissionAssignment.id.equals(id) && permissionAssignment.resourceId === resourceId;
  });
};

async function deletePermissionAssignment(db, { userId, orgId, permissionId, resourceId }) {
  const UserModel = db.model('User');
  const OrgModel = db.model('Org');
  const OrgMembershipModel = db.model('OrgMembership');

  // acquire user from db
  const user = await UserModel.findOne({
    _id: ObjectId(userId),
  });

  // ensure user exists
  if (!user) {
    throw new UserNotFoundError('User does not exist');
  }

  if (orgId) {
    // acquire org from db
    const org = await OrgModel.findOne({
      _id: ObjectId(orgId),
    });

    // ensure org exists (if specified)
    if (!org) {
      throw new OrgNotFoundError('Org does not exist');
    }
  }

  // acquire org membership from db
  const orgMembership = await OrgMembershipModel.findOne({
    orgId: orgId ? ObjectId(orgId) : null,
    userId: ObjectId(userId),
  });

  // ensure user is member of org
  if (!orgMembership) {
    throw new OrgMembershipNotFoundError(`User ${userId} is not a member of org ${orgId}`);
  }

  // ensure permission assignment exists
  if (
    !existsPermissionAssignment(orgMembership.permissions, {
      id: ObjectId(permissionId),
      resourceId,
    })
  ) {
    throw new PermissionAssignmentNotFoundError('PermissionAssignment does not exist');
  }

  // remove permission assignment
  const result = await OrgMembershipModel.updateOne(
    {
      orgId: orgId ? ObjectId(orgId) : null,
      userId: ObjectId(userId),
    },
    {
      $pull: {
        permissions: {
          id: ObjectId(permissionId),
          resourceId,
        },
      },
    }
  );

  return !!result.ok;
}

export default deletePermissionAssignment;
