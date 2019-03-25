import { ObjectId } from 'mongodb';
import differenceWith from 'lodash/differenceWith';
import { PermissionNotFoundError, DuplicateRoleError } from '../../../constants/errors';

async function createRole({ db }, { name, description, permissions, scope }) {
  const PermissionModel = db.model('Permission');
  const RoleModel = db.model('Role');

  // ensure permissions exist + have same scope as the specified scope
  const permissionRecords = await PermissionModel.find(
    {
      _id: { $in: permissions.map((permissionId) => ObjectId(permissionId)) },
      scope: { $in: scope ? [null, scope] : [null] }, // scope (if specified) or global
    },
    {
      _id: 1,
    }
  );

  if (permissionRecords.length !== permissions.length) {
    const diffPermissions = differenceWith(
      permissions.map((permissionId) => ObjectId(permissionId)),
      permissionRecords.map((permission) => permission._id),
      (a, b) => a.equals(b)
    );

    throw new PermissionNotFoundError(
      `Permission "${diffPermissions[0].toHexString()}" does not exist or is not accessible`
    );
  }

  // create role in db
  try {
    const role = await RoleModel.create({
      name,
      description,
      isSystemRole: false,
      permissions: permissions.map((permission) => ObjectId(permission)),
      scope,
    });

    return {
      id: role._id.toHexString(),
      name: role.name,
      description: role.description,
      scope: role.scope ? role.scope.toHexString() : null,
      permissions,
      isSystemRole: role.isSystemRole,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  } catch (err) {
    if (err.code === 11000) {
      throw new DuplicateRoleError(`Role "${name}" already exists`);
    }

    throw err;
  }
}

export default createRole;
