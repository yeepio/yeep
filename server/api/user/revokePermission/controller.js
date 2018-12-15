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
import deletePermissionAssignment from './service';
import { AuthorizationError } from '../../../constants/errors';

const validationSchema = {
  body: {
    userId: Joi.string()
      .length(24)
      .hex()
      .required(),
    orgId: Joi.string()
      .length(24)
      .hex()
      .optional(),
    permissionId: Joi.string()
      .length(24)
      .hex()
      .required(),
    resourceId: Joi.alternatives().try(
      Joi.number(),
      Joi.string()
        .trim()
        .min(2)
        .max(140)
    ),
  },
};

const isUserAuthorized = async ({ request }, next) => {
  const hasPermission = [request.body.orgId]
    .filter(Boolean)
    .concat(null)
    .reduce((accumulator, orgId) => {
      return (
        accumulator ||
        findUserPermissionIndex(request.session.user.permissions, {
          name: 'yeep.role.assignment.write',
          orgId,
        }) !== -1
      );
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
  const isPermissionAssignmentDeleted = await deletePermissionAssignment(db, request.body);

  if (!isPermissionAssignmentDeleted) {
    throw Boom.internal();
  }

  response.status = 200; // OK
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
