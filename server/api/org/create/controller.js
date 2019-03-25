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
import createOrg from './service';
import { AuthorizationError } from '../../../constants/errors';

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

const isUserAuthorized = async ({ request }, next) => {
  const hasPermission =
    findUserPermissionIndex(request.session.user.permissions, {
      name: 'yeep.org.write',
      orgId: null,
    }) !== -1;

  if (!hasPermission) {
    throw new AuthorizationError(
      `User ${request.session.user.id} does not have sufficient permissions to access this resource`
    );
  }

  await next();
};

const authz = compose([decorateUserPermissions(), isUserAuthorized]);

const adaptiveAuthZ = async (ctx, next) => {
  const { isOrgCreationOpen } = ctx.config;

  if (!isOrgCreationOpen) {
    return authz(ctx, next);
  }

  await next();
};

async function handler({ request, response, db }) {
  const org = await createOrg(db, {
    ...request.body,
    adminId: request.session.user.id,
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
  adaptiveAuthZ,
  handler,
]);
