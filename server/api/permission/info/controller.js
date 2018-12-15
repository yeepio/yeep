import Joi from 'joi';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  visitSession,
  isUserAuthenticated,
  visitUserPermissions,
  findUserPermissionIndex,
} from '../../../middleware/auth';
import getPermissionInfo from './service';
import { AuthorizationError } from '../../../constants/errors';

const validationSchema = {
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
  },
};

const visitRequestedPermission = async ({ request, db }, next) => {
  const permission = await getPermissionInfo(db, request.body);

  // visit session with requested permission data
  request.session = {
    ...request.session,
    permission,
  };

  await next();
};

const isUserAuthorized = async ({ request }, next) => {
  const hasPermission =
    findUserPermissionIndex(request.session.user.permissions, {
      name: 'yeep.permission.read',
      orgId: request.session.permission.scope,
    }) !== -1;

  if (!hasPermission) {
    throw new AuthorizationError(
      `User "${
        request.session.user.username
      }" does not have sufficient permissions to access this resource`
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
  visitSession(),
  isUserAuthenticated(),
  validateRequest(validationSchema),
  visitRequestedPermission,
  visitUserPermissions(),
  isUserAuthorized,
  handler,
]);
