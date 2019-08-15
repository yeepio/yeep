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
import getPermissionInfo from './service';
import { AuthorizationError } from '../../../constants/errors';

export const validationSchema = {
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
  },
};

const populatePermissionInfo = async (ctx, next) => {
  const { request } = ctx;
  const permission = await getPermissionInfo(ctx, request.body);

  // decorate session with requested permission data
  request.session = {
    ...request.session,
    permission,
  };

  await next();
};

const isUserAuthorized = async ({ request }, next) => {
  const hasPermission = (request.session.permission.org
    ? [request.session.permission.org.id, null]
    : [null]
  ).some(
    (orgId) =>
      findUserPermissionIndex(request.session.user.permissions, {
        name: 'yeep.permission.read',
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
    permission: request.session.permission,
  };
}

export default compose([
  packJSONRPC,
  decorateSession(),
  isUserAuthenticated(),
  validateRequest(validationSchema),
  populatePermissionInfo,
  decorateUserPermissions(),
  isUserAuthorized,
  handler,
]);
