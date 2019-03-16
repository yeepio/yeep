import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  visitSession,
  isUserAuthenticated,
  visitUserPermissions,
  findUserPermissionIndex,
} from '../../../middleware/auth';
import deletePermission from './service';
import getPermissionInfo from '../info/service';
import { AuthorizationError } from '../../../constants/errors';

export const validationSchema = {
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
  },
};

const visitRequestedPermission = async ({ request, db }, next) => {
  const permission = await getPermissionInfo(db, request.body);

  // visit session with requested permission
  request.session = {
    ...request.session,
    permission,
  };

  await next();
};

const isUserAuthorized = async ({ request }, next) => {
  const hasPermission = Array.from(new Set([request.session.permission.scope, null])).some(
    (orgId) =>
      findUserPermissionIndex(request.session.user.permissions, {
        name: 'yeep.permission.write',
        orgId,
      }) !== -1
  );

  if (!hasPermission) {
    throw new AuthorizationError(
      `User "${
        request.session.user.username
      }" does not have sufficient permissions to access this resource`
    );
  }

  await next();
};

async function handler({ request, response, db }) {
  const isPermissionDeleted = await deletePermission(db, request.session.permission);

  if (!isPermissionDeleted) {
    throw Boom.internal();
  }

  response.status = 200; // OK
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
