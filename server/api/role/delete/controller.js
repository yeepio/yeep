import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  decorateSession,
  isUserAuthenticated,
  decorateUserPermissions,
  findUserPermissionIndex,
} from '../../../middleware/auth';
import deleteRole from './service';
import { AuthorizationError } from '../../../constants/errors';
import { getRole } from '../middleware';

export const validationSchema = {
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
  },
};

const isUserAuthorized = async ({ request }, next) => {
  const hasPermission = Array.from(new Set([request.session.role.scope, null])).some(
    (orgId) =>
      findUserPermissionIndex(request.session.user.permissions, {
        name: 'yeep.role.write',
        orgId,
      }) !== -1
  );

  if (!hasPermission) {
    throw new AuthorizationError(
      `User ${request.session.user.id} does not have sufficient permissions to access this resource`
    );
  }

  await next();
};

async function handler(ctx) {
  const { request, response } = ctx;
  const isRoleDeleted = await deleteRole(ctx, request.session.role);

  if (!isRoleDeleted) {
    throw Boom.internal();
  }

  response.status = 200; // OK
}

export default compose([
  packJSONRPC,
  decorateSession(),
  isUserAuthenticated(),
  validateRequest(validationSchema),
  getRole,
  decorateUserPermissions(),
  isUserAuthorized,
  handler,
]);
