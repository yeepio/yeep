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
import deleteRole from './service';
import getRoleInfo from '../info/service';
import { AuthorizationError } from '../../../constants/errors';

const validationSchema = {
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
  },
};

const visitRequestedRole = async ({ request, db }, next) => {
  const role = await getRoleInfo(db, request.body);

  // visit session with requested role data
  request.session = {
    ...request.session,
    role,
  };

  await next();
};

const isUserAuthorized = async ({ request }, next) => {
  const hasPermission =
    findUserPermissionIndex(request.session.user.permissions, {
      name: 'yeep.role.write',
      orgId: request.session.role.scope,
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

async function handler({ request, response, db }) {
  const isRoleDeleted = await deleteRole(db, request.session.role);

  if (!isRoleDeleted) {
    throw Boom.internal();
  }

  response.status = 200; // OK
}

export default compose([
  packJSONRPC,
  visitSession(),
  isUserAuthenticated(),
  validateRequest(validationSchema),
  visitRequestedRole,
  visitUserPermissions(),
  isUserAuthorized,
  handler,
]);
