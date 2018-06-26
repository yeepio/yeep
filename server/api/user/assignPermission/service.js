import omitBy from 'lodash/fp/omitBy';
import {
  DuplicatePermissionAssignmentError,
  UserNotFoundError,
  OrgNotFoundError,
  PermissionNotFoundError,
  InvalidPermissionAssignmentError,
} from '../../../constants/errors';

const omitUndefinedOptionalValues = omitBy((v) => v === undefined);

async function createPermissionAssignment(db, { userId, orgId, permissionId, resourceId }) {
  const UserModel = db.model('User');
  const OrgModel = db.model('Org');
  const PermissionModel = db.model('Permission');
  const PermissionAssignmentModel = db.model('PermissionAssignment');

  // ensure user exists
  const user = await UserModel.findOne({
    _id: userId,
  });

  if (!user) {
    throw new UserNotFoundError('User does not exist');
  }

  // ensure org exists (if specified)
  if (orgId) {
    const org = await OrgModel.findOne({
      _id: orgId,
    });

    if (!org) {
      throw new OrgNotFoundError('Org does not exist');
    }
  }

  // ensure permission exists
  const permission = await PermissionModel.findOne({
    _id: permissionId,
  });

  if (!permission) {
    throw new PermissionNotFoundError('Permission does not exist');
  }

  // ensure permission scope matches org
  if (permission.scope && !permission.scope.equals(orgId)) {
    throw new InvalidPermissionAssignmentError(
      `Permission ${permission.id} cannot be assigned to the designated org`
    );
  }

  // create permission assignment in db
  try {
    const permissionAssignment = await PermissionAssignmentModel.create(
      omitUndefinedOptionalValues({
        user: userId,
        org: orgId,
        permission: permissionId,
        resource: resourceId,
      })
    );

    return {
      id: permissionAssignment.id,
      userId: permissionAssignment.user,
      orgId: permissionAssignment.org,
      permissionId: permissionAssignment.permission,
      resourceId: permissionAssignment.resourceId,
    };
  } catch (err) {
    if (err.code === 11000) {
      throw new DuplicatePermissionAssignmentError(
        `Permission ${permission.id} already assigned to the designated user`
      );
    }

    throw err;
  }
}

export default createPermissionAssignment;
