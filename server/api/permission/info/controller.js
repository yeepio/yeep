import Joi from 'joi';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  visitSession,
  isUserAuthenticated,
  visitUserPermissions,
  isUserAuthorized,
} from '../../../middleware/auth';
import getPermissionInfo from './service';

const validationSchema = {
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
  },
};

const visitRequestedPermission = async ({ request, db }, next) => {
  const permission = await getPermissionInfo(db, request.body);

  // visit session with requested permission data
  request.session = {
    ...request.session,
    permission,
  };

  await next();
};

async function handler({ request, response }) {
  response.status = 200; // OK
  response.body = {
    permission: request.session.permission,
  };
}

export default compose([
  packJSONRPC,
  visitSession(),
  isUserAuthenticated(),
  validateRequest(validationSchema),
  visitRequestedPermission,
  visitUserPermissions(),
  isUserAuthorized({
    permissions: ['yeep.permission.read'],
    org: (request) => request.session.permission.scope,
  }),
  handler,
]);
