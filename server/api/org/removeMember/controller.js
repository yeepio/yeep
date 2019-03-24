import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  findUserPermissionIndex,
  decorateUserPermissions,
  decorateSession,
  isUserAuthenticated,
} from '../../../middleware/auth';
import { AuthorizationError } from '../../../constants/errors';
import addMemberToOrg from './service';

export const validationSchema = {
  body: {
    userId: Joi.string()
      .length(24)
      .hex()
      .required(),
    orgId: Joi.string()
      .length(24)
      .hex()
      .required(),
  },
};

const isUserAuthorized = async ({ request }, next) => {
  const hasPermission = [request.body.orgId, null].some(
    (orgId) =>
      findUserPermissionIndex(request.session.user.permissions, {
        name: 'yeep.user.write',
        orgId,
      }) !== -1
  );

  if (!hasPermission) {
    throw new AuthorizationError(
      `User "${
        request.session.user.username
      }" does not have sufficient permissions to access this resource`
    );
  }

  await next();
};

async function handler({ request, response, db }) {
  const isMemberAdded = await addMemberToOrg(db, request.body);

  if (!isMemberAdded) {
    throw Boom.internal();
  }

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
