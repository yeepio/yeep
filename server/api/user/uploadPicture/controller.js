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
import { parseMultipartForm } from '../../../middleware/multipartForm';
import setUserPicture, { minImageSize, maxImageSize } from './service';
import { AuthorizationError } from '../../../constants/errors';

export const validationSchema = {
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
    picture: Joi.object().required(),
    cropSize: Joi.number()
      .integer()
      .min(minImageSize)
      .max(maxImageSize)
      .optional(),
    cropX: Joi.number()
      .integer()
      .min(0)
      .default(0)
      .optional(),
    cropY: Joi.number()
      .integer()
      .min(0)
      .default(0)
      .optional(),
  },
};

const isUserAuthorized = async ({ request }, next) => {
  const isUserRequestorIdentical = request.session.user.id === request.body.id;
  const hasPermission =
    findUserPermissionIndex(request.session.user.permissions, {
      name: 'yeep.user.write',
      orgId: null, // i.e. global permission
    }) !== -1;

  if (!isUserRequestorIdentical && !hasPermission) {
    throw new AuthorizationError(
      `User ${request.session.user.id} does not have sufficient permissions to access this resource`
    );
  }

  await next();
};

async function handler(ctx) {
  const { request, response } = ctx;
  const user = await setUserPicture(ctx, request.body);
  response.status = 200; // OK
  response.body = {
    user,
  };
}

export default compose([
  packJSONRPC,
  decorateSession(),
  isUserAuthenticated(),
  parseMultipartForm(),
  validateRequest(validationSchema),
  decorateUserPermissions(),
  isUserAuthorized,
  handler,
]);
