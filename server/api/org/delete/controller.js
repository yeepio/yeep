import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  decorateSession,
  isUserAuthenticated,
  populateUserPermissions,
} from '../../../middleware/auth';
import deleteOrg from './service';
import { AuthorizationError } from '../../../constants/errors';
import * as SortedUserPermissionArray from '../../../utils/SortedUserPermissionArray';

export const validationSchema = {
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
  },
};

const isUserAuthorized = async ({ request }, next) => {
  const hasPermission = [request.body.id, null].some((orgId) =>
    SortedUserPermissionArray.includes(request.session.user.permissions, {
      name: 'yeep.org.write',
      orgId,
    })
  );

  if (!hasPermission) {
    throw new AuthorizationError(
      `User ${request.session.user.id} is not authorized to delete org ${request.body.id}`
    );
  }

  await next();
};

async function handler(ctx) {
  const { request, response } = ctx;
  const isOrgDeleted = await deleteOrg(ctx, request.body);

  if (!isOrgDeleted) {
    throw Boom.internal();
  }

  response.status = 200; // OK
}

export default compose([
  packJSONRPC,
  decorateSession(),
  isUserAuthenticated(),
  validateRequest(validationSchema),
  populateUserPermissions,
  isUserAuthorized,
  handler,
]);
