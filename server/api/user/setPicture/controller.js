import Joi from 'joi';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  visitSession,
  isUserAuthenticated,
  visitUserPermissions,
  findUserPermissionIndex,
} from '../../../middleware/auth';
import { parseMultipartForm } from '../../../middleware/multipartForm';
import setUserPicture, { minImageSize, maxImageSize } from './service';
import { AuthorizationError } from '../../../constants/errors';

const validationSchema = {
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
  if (
    request.session.user.id !== request.body.id &&
    findUserPermissionIndex(request.session.user.permissions, {
      name: 'yeep.user.write',
      orgId: null, // i.e. global permission
    }) === -1
  ) {
    throw new AuthorizationError(
      'Requestor does not have sufficient permission to access this resource'
    );
  }

  await next();
};

async function handler({ request, response, db, storage }) {
  const user = await setUserPicture(db, storage, request.body);
  response.status = 200; // OK
  response.body = user;
}

export default compose([
  packJSONRPC,
  visitSession(),
  isUserAuthenticated(),
  parseMultipartForm(),
  validateRequest(validationSchema),
  visitUserPermissions(),
  isUserAuthorized,
  handler,
]);
