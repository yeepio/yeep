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
import createPermission from './service';
import { AuthorizationError } from '../../../constants/errors';

const validationSchema = {
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
  const hasPermission = [request.body.scope]
    .filter(Boolean)
    .concat(null)
    .reduce((accumulator, orgId) => {
      return accumulator
        ? accumulator
        : findUserPermissionIndex(request.session.user.permissions, {
            name: 'yeep.permission.write',
            orgId,
          }) !== -1;
    }, false);

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
  const permission = await createPermission(db, request.body);

  response.status = 200; // OK
  response.body = {
    permission,
  };
}

export default compose([
  packJSONRPC,
  visitSession(),
  isUserAuthenticated(),
  validateRequest(validationSchema),
  visitUserPermissions(),
  isUserAuthorized,
  handler,
]);
