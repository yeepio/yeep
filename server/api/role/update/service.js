import { ObjectId } from 'mongodb';
import differenceWith from 'lodash/differenceWith';
import {
  ImmutableRoleError,
  PermissionNotFoundError,
  DuplicateRoleError,
} from '../../../constants/errors';

async function updateRole(db, role, nextProps) {
  const PermissionModel = db.model('Permission');
  const RoleModel = db.model('Role');

  // make sure role is not system-defined
  if (role.isSystemRole) {
    throw new ImmutableRoleError(`Role ${role.id} is a system role and thus cannot be updated`);
  }

  // ensure next permissions exist + have same scope as the specified role
  if (nextProps.permissions) {
    const permissionRecords = await PermissionModel.find(
      {
        _id: { $in: nextProps.permissions.map((permissionId) => ObjectId(permissionId)) },
        scope: { $in: role.scope ? [null, role.scope] : [null] }, // scope (if specified) or global
      },
      {
        _id: 1, // project only _id fields
      }
    );

    if (permissionRecords.length !== nextProps.permissions.length) {
      const diffPermissions = differenceWith(
        nextProps.permissions.map((permissionId) => ObjectId(permissionId)),
        permissionRecords.map((permission) => permission._id),
        (a, b) => a.equals(b)
      );

      throw new PermissionNotFoundError(
        `Permission ${diffPermissions[0].toHexString()} does not exist or is not accessible`
      );
    }
  }

  // update role in db
  try {
    const updatedAt = new Date();
    await RoleModel.updateOne(
      {
        _id: ObjectId(role.id),
      },
      {
        $set: {
          ...nextProps,
          updatedAt,
        },
      }
    );

    return {
      ...role,
      ...nextProps,
      updatedAt,
    };
  } catch (err) {
    if (err.code === 11000) {
      throw new DuplicateRoleError(`Role "${nextProps.name}" already exists`);
    }

    throw err;
  }
}

export default updateRole;
