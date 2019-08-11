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
import getRoleInfo from './service';
import { AuthorizationError } from '../../../constants/errors';

export const validationSchema = {
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
  },
};

const decorateRequestedRole = async (ctx, next) => {
  const { request } = ctx;
  const role = await getRoleInfo(ctx, request.body);

  // decorate session with requested role data
  request.session = {
    ...request.session,
    role,
  };

  await next();
};

const isUserAuthorized = async ({ request }, next) => {
  const hasPermission = Array.from(new Set([request.session.role.org.id, null])).some(
    (orgId) =>
      findUserPermissionIndex(request.session.user.permissions, {
        name: 'yeep.role.read',
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

async function handler({ request, response }) {
  response.status = 200; // OK
  response.body = {
    role: request.session.role,
  };
}

export default compose([
  packJSONRPC,
  decorateSession(),
  isUserAuthenticated(),
  validateRequest(validationSchema),
  decorateRequestedRole,
  decorateUserPermissions(),
  isUserAuthorized,
  handler,
]);
