import { ObjectId } from 'mongodb';
import {
  DuplicatePermissionAssignmentError,
  UserNotFoundError,
  OrgNotFoundError,
  PermissionNotFoundError,
  InvalidPermissionAssignmentError,
  OrgMembershipNotFoundError,
} from '../../../constants/errors';

const existsPermissionAssignment = (permissionAssignments, { id, resourceId }) => {
  return permissionAssignments.some((permissionAssignment) => {
    return permissionAssignment.id.equals(id) && permissionAssignment.resourceId === resourceId;
  });
};

async function createPermissionAssignment(db, { userId, orgId, permissionId, resourceId }) {
  const UserModel = db.model('User');
  const OrgModel = db.model('Org');
  const PermissionModel = db.model('Permission');
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

  // acquire permission from db
  const permission = await PermissionModel.findOne({
    _id: ObjectId(permissionId),
  });

  // ensure permission exists
  if (!permission) {
    throw new PermissionNotFoundError('Permission does not exist');
  }

  // ensure permission scope matches org
  if (permission.scope && !permission.scope.equals(orgId)) {
    throw new InvalidPermissionAssignmentError(
      `Permission ${permission.id} cannot be assigned to the designated org`
    );
  }

  // acquire org membership from db
  const orgMembership = await OrgMembershipModel.findOne({
    orgId: orgId ? ObjectId(orgId) : null,
    userId: ObjectId(userId),
  });

  // ensure user is member of org
  if (!orgMembership) {
    throw new OrgMembershipNotFoundError(`User ${user.id} is not a member of org ${orgId}`);
  }

  // ensure permission assignments does not already exist
  if (
    existsPermissionAssignment(orgMembership.permissions, {
      id: ObjectId(permissionId),
      resourceId,
    })
  ) {
    throw new DuplicatePermissionAssignmentError(
      `Permission ${permission.id} already assigned to the designated user`
    );
  }

  // create permission assignment
  await OrgMembershipModel.updateOne(
    {
      orgId: orgId ? ObjectId(orgId) : null,
      userId: ObjectId(userId),
    },
    {
      $push: {
        permissions: {
          id: ObjectId(permissionId),
          resourceId,
        },
      },
    }
  );

  return {
    userId,
    orgId: orgId || null,
    permissionId,
    resourceId,
  };
}

export default createPermissionAssignment;
