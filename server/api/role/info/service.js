import { ObjectId } from 'mongodb';
import { RoleNotFoundError } from '../../../constants/errors';

async function getRoleInfo(db, { id }) {
  const RoleModel = db.model('Role');

  // retrieve role from db
  const role = await RoleModel.findOne({
    _id: ObjectId(id),
  });

  // make sure role exists
  if (!role) {
    throw new RoleNotFoundError(`Role ${id} cannot be found`);
  }

  return {
    id: role._id.toHexString(),
    name: role.name,
    description: role.description,
    scope: role.scope ? role.scope.toHexString() : null,
    permissions: role.permissions.map((permission) => permission.toHexString()),
    isSystemRole: role.isSystemRole === true,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
}

export default getRoleInfo;
