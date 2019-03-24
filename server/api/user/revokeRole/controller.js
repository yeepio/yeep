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
import deleteRoleAssignment from './service';
import { AuthorizationError } from '../../../constants/errors';

export const validationSchema = {
  body: {
    userId: Joi.string()
      .length(24)
      .hex()
      .required(),
    orgId: Joi.string()
      .length(24)
      .hex()
      .optional(),
    roleId: Joi.string()
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
  const hasPermission = Array.from(new Set([request.body.orgId, null])).some(
    (orgId) =>
      findUserPermissionIndex(request.session.user.permissions, {
        name: 'yeep.role.assignment.write',
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
  const isRoleAssignmentDeleted = await deleteRoleAssignment(db, request.body);

  if (!isRoleAssignmentDeleted) {
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
