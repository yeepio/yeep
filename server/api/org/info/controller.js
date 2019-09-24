import Joi from 'joi';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  decorateSession,
  isUserAuthenticated,
  populateUserPermissions,
} from '../../../middleware/auth';
import { AuthorizationError } from '../../../constants/errors';
import { getOrgInfo } from './service';
import * as SortedUserPermissionArray from '../../../utils/SortedUserPermissionArray';

const validationSchema = {
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
  },
};

async function isUserAuthorized({ request }, next) {
  const hasPermission = [request.body.id, null].some((orgId) =>
    SortedUserPermissionArray.includes(request.session.user.permissions, {
      name: 'yeep.org.write',
      orgId,
    })
  );

  if (!hasPermission) {
    throw new AuthorizationError(
      `User ${request.session.user.id} is not authorized to retrieve info on org ${request.body.id}`
    );
  }

  await next();
}

async function handler(ctx) {
  const { request, response } = ctx;
  const org = await getOrgInfo(ctx, request.body);

  response.status = 200; // OK
  response.body = {
    org,
  };
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
