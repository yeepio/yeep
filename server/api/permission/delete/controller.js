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
import deletePermission from './service';
import getPermissionInfo from '../info/service';

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

  // visit session with requested permission
  request.session = {
    ...request.session,
    permission,
  };

  await next();
};

async function handler({ request, response, db }) {
  const isPermissionDeleted = await deletePermission(db, request.session.permission);

  if (!isPermissionDeleted) {
    throw Boom.internal();
  }

  response.status = 200; // OK
}

export default compose([
  packJSONRPC,
  visitSession(),
  isUserAuthenticated(),
  createValidationMiddleware(validationSchema),
  visitRequestedPermission,
  visitUserPermissions(),
  isUserAuthorized({
    permissions: ['yeep.permission.write'],
    org: (request) => request.session.permission.scope,
  }),
  handler,
]);
