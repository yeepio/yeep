import Joi from 'joi';
import compose from 'koa-compose';
import Boom from 'boom';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  findUserPermissionIndex,
  decorateUserPermissions,
  decorateSession,
  isUserAuthenticated,
} from '../../../middleware/auth';
import getUserInfo from '../info/service';
import initEmailVerification from './service';
import { AuthorizationError } from '../../../constants/errors';

export const validationSchema = {
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
    emailAddress: Joi.string()
      .email()
      .required(),
    tokenExpiresInSeconds: Joi.number()
      .integer()
      .min(0)
      .max(30 * 24 * 60 * 60) // i.e. 30 days
      .optional()
  },
};

const isUserAuthorized = async ({ request }, next) => {
  const isUserRequestorIdentical = request.session.user.id === request.body.id;
  const isRequestorSuperUser = findUserPermissionIndex(request.session.user.permissions, {
    name: 'yeep.user.write',
    orgId: null,
  }) !== -1;

  if (!isUserRequestorIdentical && !isRequestorSuperUser) {
    throw new AuthorizationError(
      `User ${request.session.user.id} is not authorized to access this resource`
    );
  }

    // only superusers are allowed to set token expiration date
  if (!isRequestorSuperUser && request.body.tokenExpiresInSeconds) {
    const boom = Boom.badRequest('Invalid request body');
    boom.output.payload.details = [
      {
        path: ['tokenExpiresInSeconds'],
        type: 'any.unknown',
        message: '"tokenExpiresInSeconds" is not allowed',
      },
    ];
    throw boom;
  } else {
    request.body.tokenExpiresInSeconds = 3 * 60 * 60 // i.e. 3 hours
  }

  await next();
};

const decorateRequestedUser = async (ctx, next) => {
  const { request } = ctx;
  const user = await getUserInfo(ctx, request.body);

  // decorate session object with requested user data
  request.session = {
    ...request.session,
    requestedUser: user,
  };

  await next();
};

async function handler(ctx) {
  const { request, response } = ctx;
  await initEmailVerification(ctx, request.session.requestedUser, request.body);

  response.status = 200; // OK
  // response.body = {
  // };
}

export default compose([
  packJSONRPC,
  decorateSession(),
  isUserAuthenticated(),
  validateRequest(validationSchema),
  decorateUserPermissions(),
  decorateRequestedUser,
  isUserAuthorized,
  handler,
]);
