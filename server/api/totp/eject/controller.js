import Joi from 'joi';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  decorateSession,
  isUserAuthenticated,
  decorateUserPermissions,
  findUserPermissionIndex,
} from '../../../middleware/auth';
import { ejectTOTPAuthFactor } from './service';
import { AuthorizationError } from '../../../constants/errors';
import * as authFactorTypes from '../../../constants/authFactorTypes';

export const validationSchema = {
  body: {
    userId: Joi.string()
      .length(24)
      .hex()
      .required(),
    secondaryAuthFactor: Joi.object({
      type: Joi.string()
        .valid(Object.values(authFactorTypes))
        .required(),
      token: Joi.string()
        .min(6)
        .max(50)
        .required(),
    }).optional(),
  },
};

const isUserAuthorized = async ({ request }, next) => {
  const isUserRequestorIdentical = request.session.user.id === request.body.userId;
  const isRequestorSuperUser =
    findUserPermissionIndex(request.session.user.permissions, {
      name: 'yeep.user.write',
      orgId: null, // i.e. global scope
    }) !== -1;

  if (!(isUserRequestorIdentical || isRequestorSuperUser)) {
    throw new AuthorizationError(
      `User ${request.session.user.id} is not authorized to perform this action`
    );
  }

  await next();
};

async function handler(ctx) {
  const { request, response } = ctx;

  await ejectTOTPAuthFactor(ctx, {
    ...request.body,
    isMFARequired: request.session.user.id === request.body.userId,
  });

  response.status = 200; // OK
}

export default compose([
  packJSONRPC,
  decorateSession(),
  isUserAuthenticated(),
  validateRequest(validationSchema),
  decorateUserPermissions(),
  isUserAuthorized,
  handler,
]);
