import { ObjectId } from 'mongodb';
import differenceWith from 'lodash/differenceWith';
import addSeconds from 'date-fns/add_seconds';
import isBefore from 'date-fns/is_before';
import {
  UserNotFoundError,
  UserDeactivatedError,
  OrgNotFoundError,
  PermissionNotFoundError,
  InvalidPermissionAssignmentError,
  RoleNotFoundError,
  InvalidRoleAssignmentError,
  OrgMembershipAlreadyExists,
} from '../../../constants/errors';

const addMemberToOrg = async (
  db,
  { orgId, userId, permissions = [], roles = [], expiresInSeconds }
) => {
  const OrgModel = db.model('Org');
  const PermissionModel = db.model('Permission');
  const RoleModel = db.model('Role');
  const UserModel = db.model('User');
  const OrgMembershipModel = db.model('OrgMembership');

  // acquire org from db
  const org = await OrgModel.findOne({
    _id: ObjectId(orgId),
  });

  // ensure org exists
  if (!org) {
    throw new OrgNotFoundError(`Org "${orgId}" does not exist`);
  }

  // acquire user from db
  const user = await UserModel.findOne({
    _id: ObjectId(userId),
  });

  // ensure user exists
  if (!user) {
    throw new UserNotFoundError(`User "${userId}" does not exist`);
  }

  // make sure user is active
  if (!!user.deactivatedAt && isBefore(user.deactivatedAt, new Date())) {
    throw new UserDeactivatedError(`User "${userId}" is deactivated`);
  }

  // acquire org membership from db
  const orgMembership = await OrgMembershipModel.findOne({
    orgId: org._id,
    userId: user._id,
  });

  // ensure org membership does not already exist
  if (orgMembership) {
    throw new OrgMembershipAlreadyExists(`User "${userId}" is already a member of org "${orgId}"`);
  }

  if (permissions.length !== 0) {
    const permissionRecords = await PermissionModel.find({
      _id: { $in: permissions.map((e) => ObjectId(e.id)) },
    });

    // ensure permissions exist
    if (permissionRecords.length !== permissions.length) {
      const diffPermissions = differenceWith(
        permissions.map((e) => ObjectId(e.id)),
        permissionRecords.map((e) => e._id),
        (a, b) => a.equals(b)
      );

      throw new PermissionNotFoundError(
        `Permission "${diffPermissions[0].toHexString()}" does not exist`
      );
    }

    // ensure permissions scope matches org
    permissionRecords.forEach((permission) => {
      if (!permission.scope || !permission.scope.equals(orgId)) {
        throw new InvalidPermissionAssignmentError(
          `Permission "${permission._id.toHexString()}" cannot be assigned to the designated org`
        );
      }
    });
  }

  if (roles.length !== 0) {
    const roleRecords = await RoleModel.find({
      _id: { $in: roles.map((e) => ObjectId(e.id)) },
    });

    // ensure roles exist
    if (roleRecords.length !== roles.length) {
      const diffPermissions = differenceWith(
        roles.map((e) => ObjectId(e.id)),
        roleRecords.map((e) => e._id),
        (a, b) => a.equals(b)
      );

      throw new RoleNotFoundError(`Role "${diffPermissions[0].toHexString()}" does not exist`);
    }

    // ensure role scope matches org
    roleRecords.forEach((role) => {
      if (!role.scope || !role.scope.equals(orgId)) {
        throw new InvalidRoleAssignmentError(
          `Role "${role._id.toHexString()}" cannot be assigned to the designated org`
        );
      }
    });
  }

  // create org membership
  await OrgMembershipModel.create({
    userId: user._id,
    orgId: org._id,
    roles: roles.map((e) => ({
      id: ObjectId(e),
      resourceId: e.resourceId,
    })),
    permissions: permissions.map((e) => ({
      id: ObjectId(e),
      resourceId: e.resourceId,
    })),
    expiresAt: expiresInSeconds ? addSeconds(new Date(), expiresInSeconds) : null,
  });

  return true;
};

export default addMemberToOrg;
