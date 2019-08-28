import Joi from 'joi';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  decorateSession,
  isUserAuthenticated,
  populateUserPermissions,
} from '../../../middleware/auth';
import createOrg from './service';
import { AuthorizationError } from '../../../constants/errors';
import * as SortedUserPermissionArray from '../../../utils/SortedUserPermissionArray';

export const validationSchema = {
  body: {
    name: Joi.string()
      .trim()
      .min(3)
      .max(100)
      .required(),
    slug: Joi.string()
      .lowercase()
      .trim()
      .min(3)
      .max(30)
      .required()
      .regex(/^[A-Za-z0-9\-_]*$/, { name: 'slug' }),
  },
};

async function isUserAuthorized({ request, config }, next) {
  if (config.isOrgCreationOpen === false) {
    // ensure user is authorized to create orgs
    const hasPermission = SortedUserPermissionArray.includes(request.session.user.permissions, {
      name: 'yeep.org.write',
      orgId: null,
    });

    if (!hasPermission) {
      throw new AuthorizationError(
        `User ${request.session.user.id} is not authorized to create orgs`
      );
    }
  }

  await next();
}

async function handler(ctx) {
  const { request, response } = ctx;

  const isGlobalAdmin = SortedUserPermissionArray.includes(request.session.user.permissions, {
    name: 'yeep.org.write',
    orgId: null,
  });

  const org = await createOrg(ctx, {
    ...request.body,
    adminId: isGlobalAdmin ? null : request.session.user.id,
  });

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
