import { RoleNotFoundError } from '../../constants/errors';
import { ObjectId } from 'mongodb';

export async function getRoleIfExists(ctx, next) {
  const { request, db } = ctx;
  const roleId = request.body.role;

  if (request.body.role) {
    const RoleModel = db.model('Role');

    const role = await RoleModel.findOne({
      _id: ObjectId(roleId),
    });

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
