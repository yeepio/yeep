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
  { db, bus },
  {
    orgId,
    permissions = [],
    roles = [],
    tokenExpiresInSeconds = defaultTokenExpiresInSeconds,
    inviteeUsername,
    inviteeEmailAddress,
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
  const orgRecord = await OrgModel.findOne({
    _id: ObjectId(orgId),
  });

  // ensure org exists
  if (!orgRecord) {
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
  const userRecord = await UserModel.findOne(
    inviteeUsername
      ? { username: inviteeUsername }
      : {
          emails: { $elemMatch: { address: inviteeEmailAddress } },
        }
  );

  // ensure user exists
  if (!userRecord && inviteeUsername) {
    throw new UserNotFoundError(`User "${inviteeUsername}" does not exist`);
  }

  // ensure user is active
  if (userRecord && !!userRecord.deactivatedAt && isBefore(userRecord.deactivatedAt, new Date())) {
    throw new UserDeactivatedError(
      `User "${inviteeUsername || inviteeEmailAddress}" is deactivated`
    );
  }

  // create invitation token
  const tokenRecord = await TokenModel.create({
    secret: TokenModel.generateSecret({ length: 24 }),
    type: 'INVITATION',
    payload: {
      roles,
      permissions,
      emailAddress: userRecord ? userRecord.findPrimaryEmail() : inviteeEmailAddress,
    },
    user: userRecord ? userRecord._id : null,
    org: orgId,
    expiresAt: addSeconds(new Date(), tokenExpiresInSeconds), // i.e. in 1 hour
  });

  // emit event
  bus.emit('invite_user', {
    invitee: userRecord
      ? {
          id: userRecord._id.toHexString(),
          fullName: userRecord.fullName,
          picture: userRecord.picture,
          emailAddress: userRecord.findPrimaryEmail(),
        }
      : {
          emailAddress: inviteeEmailAddress,
        },
    inviter: {
      id: inviterId,
      username: inviterUsername,
      fullName: inviterFullName,
      picture: inviterPicture,
      emailAddress: inviterEmailAddress,
    },
    token: {
      id: tokenRecord._id.toHexString(),
      secret: tokenRecord.secret,
      type: tokenRecord.type,
      createdAt: tokenRecord.createdAt,
      expiresAt: tokenRecord.expiresAt,
    },
  });

  return true;
};

export default inviteUser;
