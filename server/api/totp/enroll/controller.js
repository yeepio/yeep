import Joi from 'joi';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  decorateSession,
  isUserAuthenticated,
  findUserPermissionIndex,
  decorateUserPermissions,
} from '../../../middleware/auth';
import { enrollTOTPAuthFactor } from './service';
import { AuthorizationError } from '../../../constants/errors';

export const validationSchema = {
  body: {
    userId: Joi.string()
      .length(24)
      .hex()
      .required(),
  },
};

const isUserAuthorized = async ({ request }, next) => {
  const isUserRequestorIdentical = request.session.user.id === request.body.userId;
  const isRequestorAssignedWithGlobalUserWrite =
    findUserPermissionIndex(request.session.user.permissions, {
      name: 'yeep.user.write',
      orgId: null, // i.e. global scope
    }) !== -1;

  if (!(isUserRequestorIdentical || isRequestorAssignedWithGlobalUserWrite)) {
    throw new AuthorizationError(
      `User ${request.session.user.id} is not authorized to perform this action`
    );
  }

  await next();
};

async function handler(ctx) {
  const { request, response } = ctx;

  const { secret, qrcode } = await enrollTOTPAuthFactor(ctx, request.body);

  response.status = 200; // OK
  response.body = {
    totp: {
      secret,
      qrcode,
      isPendingActivation: true,
    },
  };
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
