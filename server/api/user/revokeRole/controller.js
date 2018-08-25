import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { createValidationMiddleware } from '../../../middleware/validation';
import createAuthnMiddleware from '../../../middleware/authn';
import createAuthzMiddleware from '../../../middleware/authz';
import deleteRoleAssignment, { getRoleAssignment } from './service';

const authn = createAuthnMiddleware();
const authz = createAuthzMiddleware({
  permissions: ['yeep.role.assignment.write'],
  org: (request) => request.session.roleAssignment.orgId,
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
  const roleAssignment = await getRoleAssignment(db, request.body);

  // augment with session data
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

export default compose([packJSONRPC, authn, validation, intermission, authz, handler]);
