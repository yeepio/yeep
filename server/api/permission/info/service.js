import { PermissionNotFoundError } from '../../../constants/errors';

async function getPermissionInfo(db, { id }) {
  const PermissionModel = db.model('Permission');

  // retrieve permission from db
  const permission = await PermissionModel.findOne({
    _id: id,
  });

  // make sure permission exists
  if (!permission) {
    throw new PermissionNotFoundError(`Permission ${id} cannot be found`);
  }

  return {
    id: permission.id, // as hex string
    name: permission.name,
    description: permission.description,
    scope: permission.scope || null,
    isSystemPermission: permission.isSystemPermission === true,
  };
}

export default getPermissionInfo;
