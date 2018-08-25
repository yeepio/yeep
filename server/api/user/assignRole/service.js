import { ObjectId } from 'mongodb';
import flow from 'lodash/fp/flow';
import mapValues from 'lodash/fp/mapValues';
import omitBy from 'lodash/fp/omitBy';
import {
  UserNotFoundError,
  OrgNotFoundError,
  InvalidRoleAssignmentError,
  DuplicateRoleAssignmentError,
  RoleNotFoundError,
} from '../../../constants/errors';

const formatValues = flow(omitBy((v) => v === undefined), mapValues((v) => ObjectId(v)));

async function createRoleAssignment(db, { userId, orgId, roleId, resourceId }) {
  const UserModel = db.model('User');
  const OrgModel = db.model('Org');
  const RoleModel = db.model('Role');
  const RoleAssignmentModel = db.model('RoleAssignment');

  // ensure user exists
  const user = await UserModel.findOne({
    _id: ObjectId(userId),
  });

  if (!user) {
    throw new UserNotFoundError('User does not exist');
  }

  if (orgId) {
    // ensure org exists (if specified)
    const org = await OrgModel.findOne({
      _id: ObjectId(orgId),
    });

    if (!org) {
      throw new OrgNotFoundError('Org does not exist');
    }

    // ensure user is member of org
    const isMemberOf = user.orgs.some((oid) => oid.equals(org._id));

    if (!isMemberOf) {
      throw new InvalidRoleAssignmentError(`User ${user.id} is not a member of the designated org`);
    }
  }

  // ensure role exists
  const role = await RoleModel.findOne({
    _id: ObjectId(roleId),
  });

  if (!role) {
    throw new RoleNotFoundError(`Role ${roleId} does not exist`);
  }

  // ensure role scope matches org
  if (role.scope && !role.scope.equals(orgId)) {
    throw new InvalidRoleAssignmentError(
      `Role ${role.id} cannot be assigned to the designated org`
    );
  }

  // create role assignment in db
  try {
    const roleAssignment = await RoleAssignmentModel.create(
      formatValues({
        user: userId,
        org: orgId,
        role: roleId,
        resource: resourceId,
      })
    );

    return {
      id: roleAssignment._id.toHexString(),
      userId: roleAssignment.user.toHexString(),
      orgId: roleAssignment.org ? roleAssignment.org.toHexString() : undefined,
      roleId: roleAssignment.role.toHexString(),
      resourceId: roleAssignment.resource,
    };
  } catch (err) {
    if (err.code === 11000) {
      throw new DuplicateRoleAssignmentError(
        `Role ${role.id} already assigned to the designated user`
      );
    }

    throw err;
  }
}

export default createRoleAssignment;
