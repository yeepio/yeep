import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  visitSession,
  isUserAuthenticated,
  visitUserPermissions,
  isUserAuthorized,
} from '../../../middleware/auth';
import deletePermissionAssignment, { getPermissionAssignment } from './service';

const validationSchema = {
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
  },
};

const visitRequestedPermissionAssignment = async ({ request, db }, next) => {
  const permissionAssignment = await getPermissionAssignment(db, request.body);

  // visit session object with requested permissionAssignment data
  request.session = {
    ...request.session,
    requestedPermissionAssignment: permissionAssignment,
  };

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
  visitRequestedPermissionAssignment,
  visitUserPermissions(),
  isUserAuthorized({
    permissions: ['yeep.permission.assignment.write'],
    org: (request) => request.session.requestedPermissionAssignment.orgId,
  }),
  handler,
]);
