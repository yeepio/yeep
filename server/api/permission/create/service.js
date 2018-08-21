import { DuplicatePermissionError, InvalidPermissionError } from '../../../constants/errors';

async function createPermission(db, { name, description, scope }) {
  const PermissionModel = db.model('Permission');

  if (name.startsWith('yeep.')) {
    throw new InvalidPermissionError(
      'Permissions starting with "yeep" are reserved for system use'
    );
  }

  // create permission in db
  try {
    const permission = await PermissionModel.create({
      name,
      description,
      isSystemPermission: false,
      scope,
    });

    return {
      id: permission.id, // as hex string
      name: permission.name,
      description: permission.description,
      scope: permission.scope,
      isSystemPermission: permission.isSystemPermission,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    };
  } catch (err) {
    if (err.code === 11000) {
      throw new DuplicatePermissionError(`Permission "${name}" already exists`);
    }

    throw err;
  }
}

export default createPermission;
