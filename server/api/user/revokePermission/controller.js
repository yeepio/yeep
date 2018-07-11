import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { createValidationMiddleware } from '../../../middleware/validation';
import createAuthnMiddleware from '../../../middleware/authn';
import createAuthzMiddleware from '../../../middleware/authz';
import deletePermissionAssignment, { getPermissionAssignment } from './service';

const authn = createAuthnMiddleware();
const authz = createAuthzMiddleware({
  permissions: ['yeep.permission.assignment.write'],
  org: (request) => request.session.requestedPermissionAssignment.orgId,
});

const validation = createValidationMiddleware({
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
  },
});

const intermission = async ({ request, db }, next) => {
  const permissionAssignment = await getPermissionAssignment(db, request.body);

  // augment request object with session data
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

export default compose([packJSONRPC, authn, validation, intermission, authz, handler]);
