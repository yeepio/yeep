import Joi from 'joi';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { createValidationMiddleware } from '../../../middleware/validation';
import {
  visitSession,
  isUserAuthenticated,
  visitUserPermissions,
  isUserAuthorized,
} from '../../../middleware/auth';
import getRoleInfo from './service';

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

async function handler({ request, response }) {
  response.status = 200; // OK
  response.body = {
    role: request.session.role,
  };
}

export default compose([
  packJSONRPC,
  visitSession(),
  isUserAuthenticated(),
  createValidationMiddleware(validationSchema),
  visitRequestedRole,
  visitUserPermissions(),
  isUserAuthorized({
    permissions: ['yeep.role.read'],
    org: (request) => request.session.role.scope,
  }),
  handler,
]);
