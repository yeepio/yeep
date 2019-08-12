import { RoleNotFoundError } from '../../constants/errors';
import { ObjectId } from 'mongodb';

export async function populateRole(ctx, next) {
  const { request, db } = ctx;
  const RoleModel = db.model('Role');

  const role = await RoleModel.findOne({
    _id: ObjectId(request.body.id),
  });

  if (!role) {
    throw new RoleNotFoundError(`Role ${request.body.id} not found`);
  }

  // decorate session with requested role data
  request.session = {
    ...request.session,
    role,
  };

  await next();
}
