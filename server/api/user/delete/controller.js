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
import deleteUser from './service';
import getUserInfo from '../info/service';

const validationSchema = {
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
  },
};

const visitRequestedUser = async ({ request, db }, next) => {
  const user = await getUserInfo(db, request.body);

  // visit session object with requested user data
  request.session = {
    ...request.session,
    requestedUser: user,
  };

  await next();
};

async function handler({ request, response, db }) {
  const isUserDeleted = await deleteUser(db, request.session.requestedUser);

  if (!isUserDeleted) {
    throw Boom.internal();
  }

  response.status = 200; // OK
}

export default compose([
  packJSONRPC,
  visitSession(),
  isUserAuthenticated(),
  createValidationMiddleware(validationSchema),
  visitRequestedUser,
  visitUserPermissions(),
  isUserAuthorized({
    permissions: ['yeep.user.write'],
    org: (request) => request.session.requestedUser.orgs,
  }),
  handler,
]);
