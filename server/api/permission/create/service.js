import { DuplicatePermissionError } from '../../../constants/errors';

async function createPermission(db, { name, description, scope }) {
  const PermissionModel = db.model('Permission');

  // create permission in db
  try {
    const permission = await PermissionModel.create({
      name,
      description,
      isSystemPermission: false,
      scope,
    });

    return {
      id: permission._id,
      name: permission.name,
      description: permission.description,
      scope: permission.scope,
      isSystemPermission: permission.isSystemPermission,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    };
  } catch (err) {
    if (err.code === 11000) {
      throw new DuplicatePermissionError(
        `Permission "${name}" with ${
          scope ? 'specified' : 'global'
        } scope already exists`
      );
    }

    throw err;
  }
}

export default createPermission;
