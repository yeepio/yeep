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
import deleteRole from './service';
import getRoleInfo from '../info/service';

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
  isUserAuthorized({
    permissions: ['yeep.role.write'],
    org: (request) => request.session.role.scope,
  }),
  handler,
]);
