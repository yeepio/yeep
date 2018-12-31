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

export const defaultTokenExpiresInSeconds = 7 * 24 * 60 * 60; // i.e. 1 week

const inviteUser = async (
  db,
  bus,
  {
    orgId,
    permissions = [],
    roles = [],
    tokenExpiresInSeconds = defaultTokenExpiresInSeconds,
    username, // invitee username
    emailAddress, // invitee email address
    inviterId,
    inviterUsername,
    inviterFullName,
    inviterPicture = null,
    inviterEmailAddress,
  }
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
    _id: { $in: permissions.map((e) => ObjectId(e.id)) },
  });

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

  // ensure roles exist
  const roleRecords = await RoleModel.find({
    _id: { $in: roles.map((e) => ObjectId(e.id)) },
  });

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
      roles,
      permissions,
      emailAddress: user ? user.findPrimaryEmail() : emailAddress,
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
      id: inviterId,
      username: inviterUsername,
      fullName: inviterFullName,
      picture: inviterPicture,
      emailAddress: inviterEmailAddress,
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
