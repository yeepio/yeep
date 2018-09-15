import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { createValidationMiddleware } from '../../../middleware/validation';
import {
  visitSession,
  isUserAuthenticated,
  visitUserPermissions,
  isUserAuthorized,
} from '../../../middleware/auth';
import deleteRoleAssignment, { getRoleAssignment } from './service';

const validationSchema = {
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
  },
};

const visitRoleAssignment = async ({ request, db }, next) => {
  const roleAssignment = await getRoleAssignment(db, request.body);

  // visit session object with roleAssignment data
  request.session = {
    ...request.session,
    roleAssignment,
  };

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
  createValidationMiddleware(validationSchema),
  visitRoleAssignment,
  visitUserPermissions(),
  isUserAuthorized({
    permissions: ['yeep.role.assignment.write'],
    org: (request) => request.session.roleAssignment.orgId,
  }),
  handler,
]);
