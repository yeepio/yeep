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
} from '../../../constants/errors';

const inviteUser = async (
  db,
  bus,
  { username, emailAddress, orgId, permissions, roles, tokenExpiresInSeconds, inviter }
) => {
  const OrgModel = db.model('Org');
  const PermissionModel = db.model('Permission');
  const RoleModel = db.model('Role');
  const UserModel = db.model('User');
  const TokenModel = db.model('Token');

  // acquire org from db
  const org = await OrgModel.findOne({
    _id: ObjectId(orgId),
  });

  // ensure org exists
  if (!org) {
    throw new OrgNotFoundError(`Org "${orgId}" does not exist`);
  }

  // ensure permissions exist
  const permissionRecords = await PermissionModel.find({
    _id: { $in: permissions.map((permissionId) => ObjectId(permissionId)) },
  });

  if (permissionRecords.length !== permissions.length) {
    const diffPermissions = differenceWith(
      permissions.map((permissionId) => ObjectId(permissionId)),
      permissionRecords.map((permission) => permission._id),
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

  // ensure roles exist
  const roleRecords = await RoleModel.find({
    _id: { $in: roles.map((roleId) => ObjectId(roleId)) },
  });

  if (roleRecords.length !== roles.length) {
    const diffPermissions = differenceWith(
      roles.map((roleId) => ObjectId(roleId)),
      roleRecords.map((role) => role._id),
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

  // attempt to acquire user from db
  const user = await UserModel.findOne(
    username
      ? { username }
      : {
          emails: { $elemMatch: { address: emailAddress } },
        }
  );

  // ensure user exists
  if (!user && username) {
    throw new UserNotFoundError(`User "${username}" does not exist`);
  }

  // ensure user is active
  if (user && !!user.deactivatedAt && isBefore(user.deactivatedAt, new Date())) {
    throw new UserDeactivatedError(`User "${username || emailAddress}" is deactivated`);
  }

  // create invitation token
  const token = await TokenModel.create({
    secret: TokenModel.generateSecret({ length: 24 }),
    type: 'INVITATION',
    payload: {
      orgId,
      roles: roleRecords.map((e) => e._id),
      permissions: permissionRecords.map((e) => e._id),
    },
    userId: user ? user._id : null,
    expiresAt: addSeconds(new Date(), tokenExpiresInSeconds), // i.e. in 1 hour
  });

  // emit event
  bus.emit('invite_user', {
    invitee: user
      ? {
          id: user._id.toHexString(),
          fullName: user.fullName,
          picture: user.picture,
          emailAddress: user.findPrimaryEmail(),
        }
      : {
          emailAddress,
        },
    inviter: {
      id: inviter._id.toHexString(),
      fullName: inviter.fullName,
      picture: inviter.picture,
      emailAddress: UserModel.getPrimaryEmailAddress(inviter.emails),
    },
    token: {
      id: token._id.toHexString(),
      secret: token.secret,
      type: token.type,
      createdAt: token.createdAt,
      expiresAt: token.expiresAt,
    },
  });

  return true;
};

export default inviteUser;
