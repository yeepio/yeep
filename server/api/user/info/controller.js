import Joi from 'joi';
import compose from 'koa-compose';
import mapValues from 'lodash/mapValues';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  visitSession,
  isUserAuthenticated,
  visitUserPermissions,
  isUserAuthorized,
} from '../../../middleware/auth';
import getUserInfo, { defaultProjection } from './service';

const validationSchema = {
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
    projection: Joi.object(
      mapValues(defaultProjection, (value) =>
        Joi.boolean()
          .optional()
          .default(value)
      )
    )
      .optional()
      .default(defaultProjection),
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

async function handler({ request, response }) {
  response.status = 200; // OK
  response.body = {
    user: request.session.requestedUser,
  };
}

export default compose([
  packJSONRPC,
  visitSession(),
  isUserAuthenticated(),
  validateRequest(validationSchema),
  visitRequestedUser,
  visitUserPermissions(),
  isUserAuthorized({
    permissions: ['yeep.user.read'],
    org: (request) => request.session.requestedUser.orgs,
  }),
  handler,
]);
