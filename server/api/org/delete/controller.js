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
import deleteOrg from './service';

const validationSchema = {
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
  },
};

async function handler({ request, response, db }) {
  const isOrgDeleted = await deleteOrg(db, {
    ...request.body,
    adminId: request.session.user.id,
  });

  if (!isOrgDeleted) {
    throw Boom.internal();
  }

  response.status = 200; // OK
}

export default compose([
  packJSONRPC,
  visitSession(),
  isUserAuthenticated(),
  createValidationMiddleware(validationSchema),
  visitUserPermissions(),
  isUserAuthorized({
    permissions: ['yeep.org.write'],
    org: (request) => request.body.id,
  }),
  handler,
]);
