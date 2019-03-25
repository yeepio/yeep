import { ObjectId } from 'mongodb';
import { ImmutableRoleError } from '../../../constants/errors';

async function deleteRole({ db }, role) {
  const RoleModel = db.model('Role');

  // make sure role is not system-defined
  if (role.isSystemRole) {
    throw new ImmutableRoleError(`Role ${role.id} is a system role and thus cannot be deleted`);
  }

  const result = await RoleModel.deleteOne({ _id: ObjectId(role.id) });
  return !!result.ok;
}

export default deleteRole;
