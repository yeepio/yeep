import {
  ImmutablePermissionError,
  InvalidPermissionError,
  DuplicatePermissionError,
} from '../../../constants/errors';

async function updatePermission(db, permission, nextProps) {
  const PermissionModel = db.model('Permission');

  // make sure permission is not system-defined
  if (permission.isSystemPermission) {
    throw new ImmutablePermissionError(
      `Permission ${permission.id} is a system permission and thus cannot be updated`
    );
  }

  // make sure next name is allowed
  if (nextProps.name && nextProps.name.startsWith('yeep.')) {
    throw new InvalidPermissionError(
      'Permissions starting with "yeep" are reserved for system use'
    );
  }

  // update permission in db
  try {
    const updatedAt = new Date();
    await PermissionModel.updateOne(
      {
        _id: permission.id,
      },
      {
        $set: {
          ...nextProps,
          updatedAt,
        },
      }
    );

    return {
      ...permission,
      ...nextProps,
      updatedAt,
    };
  } catch (err) {
    if (err.code === 11000) {
      throw new DuplicatePermissionError(`Permission "${nextProps.name}" already exists`);
    }

    throw err;
  }
}

export default updatePermission;
