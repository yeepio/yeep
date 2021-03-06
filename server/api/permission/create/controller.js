import Joi from 'joi';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  decorateSession,
  isUserAuthenticated,
  decorateUserPermissions,
  findUserPermissionIndex,
} from '../../../middleware/auth';
import createPermission from './service';
import { AuthorizationError } from '../../../constants/errors';

export const validationSchema = {
  body: {
    name: Joi.string()
      .lowercase()
      .trim()
      .min(2)
      .max(64)
      .required()
      .regex(/^[A-Za-z0-9_\-.]*$/, { name: 'permission' }),
    description: Joi.string()
      .trim()
      .max(140)
      .optional(),
    scope: Joi.string()
      .length(24)
      .hex()
      .optional(),
  },
};

const isUserAuthorized = async ({ request }, next) => {
  const hasPermission = Array.from(new Set([request.body.scope, null])).some(
    (orgId) =>
      findUserPermissionIndex(request.session.user.permissions, {
        name: 'yeep.permission.write',
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
  const permission = await createPermission(ctx, request.body);

  response.status = 200; // OK
  response.body = {
    permission,
  };
}

export default compose([
  packJSONRPC,
  decorateSession(),
  isUserAuthenticated(),
  validateRequest(validationSchema),
  decorateUserPermissions(),
  isUserAuthorized,
  handler,
]);
