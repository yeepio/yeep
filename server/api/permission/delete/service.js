import { ObjectId } from 'mongodb';
import { ImmutablePermissionError } from '../../../constants/errors';

async function deletePermission({ db }, permission) {
  const PermissionModel = db.model('Permission');

  // make sure permission is not system-defined
  if (permission.isSystemPermission) {
    throw new ImmutablePermissionError(
      `Permission ${permission.id} is a system permission and thus cannot be deleted`
    );
  }

  const result = await PermissionModel.deleteOne({ _id: ObjectId(permission.id) });
  return !!result.ok;
}

export default deletePermission;
