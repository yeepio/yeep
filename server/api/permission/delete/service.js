import { PermissionNotFoundError, ImmutablePermissionError } from '../../../constants/errors';

async function deletePermission(db, { id }) {
  const PermissionModel = db.model('Permission');

  // retrieve permission from db
  const permission = await PermissionModel.findOne({
    _id: id,
  });

  // make sure permission exists
  if (!permission) {
    throw new PermissionNotFoundError(`Permission ${id} cannot be found`);
  }

  // make sure permission is not system-defined
  if (permission.isSystemPermission) {
    throw new ImmutablePermissionError(
      `Permission ${id} is a system permission and thus cannot be deleted`
    );
  }

  const result = await PermissionModel.deleteOne({ _id: id });
  return !!result.ok;
}

export default deletePermission;
