import { RoleNotFoundError, PermissionNotFoundError } from '../../constants/errors';
import { ObjectId } from 'mongodb';

export async function populateOptionalRole(ctx, next) {
  const { request, db } = ctx;
  const roleId = request.body.role;

  if (request.body.role) {
    const RoleModel = db.model('Role');

    const role = await RoleModel.findOne({
      _id: ObjectId(roleId),
    });

    // make sure role exists
    if (!role) {
      throw new RoleNotFoundError(`Role ${roleId} not found`);
    }

    // decorate session with requested role data
    request.session = {
      ...request.session,
      role,
    };
  }

  await next();
}

export async function populatePermission(ctx, next) {
  const { request, db } = ctx;
  const PermissionModel = db.model('Permission');

  const permission = await PermissionModel.findOne({
    _id: ObjectId(request.body.id),
  });

  // make sure permission exists
  if (!permission) {
    throw new PermissionNotFoundError(`Permission ${request.body.id} not found`);
  }

  // decorate request with permission
  request.session = {
    ...request.session,
    permission,
  };

  await next();
}
