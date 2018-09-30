import { ObjectId } from 'mongodb';
import {
  RoleAssignmentNotFoundError,
  UserNotFoundError,
  OrgNotFoundError,
  RoleNotFoundError,
  InvalidRoleAssignmentError,
  OrgMembershipNotFoundError,
} from '../../../constants/errors';

const existsRoleAssignment = (roleAssignments, { id, resourceId }) => {
  return roleAssignments.some((roleAssignment) => {
    return roleAssignment.id.equals(id) && roleAssignment.resourceId === resourceId;
  });
};

async function deleteRoleAssignment(db, { userId, orgId, roleId, resourceId }) {
  const UserModel = db.model('User');
  const OrgModel = db.model('Org');
  const RoleModel = db.model('Role');
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

    // ensure org exists
    if (!org) {
      throw new OrgNotFoundError('Org does not exist');
    }
  }

  // acquire role from db
  const role = await RoleModel.findOne({
    _id: ObjectId(roleId),
  });

  // ensure role exists
  if (!role) {
    throw new RoleNotFoundError(`Role ${roleId} does not exist`);
  }

  // ensure role scope matches org
  if (role.scope && !role.scope.equals(orgId)) {
    throw new InvalidRoleAssignmentError(
      `Role ${role.id} cannot be assigned to the designated org`
    );
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

  // ensure permission assignments exists
  if (
    !existsRoleAssignment(orgMembership.roles, {
      id: ObjectId(roleId),
      resourceId,
    })
  ) {
    throw new RoleAssignmentNotFoundError('RoleAssignment does not exist');
  }

  // create role assignment in db
  const result = await OrgMembershipModel.updateOne(
    {
      orgId: orgId ? ObjectId(orgId) : null,
      userId: ObjectId(userId),
    },
    {
      $pull: {
        roles: {
          id: ObjectId(roleId),
          resourceId,
        },
      },
    }
  );

  return !!result.ok;
}

export default deleteRoleAssignment;
