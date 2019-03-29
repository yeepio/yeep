import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  decorateSession,
  isUserAuthenticated,
  decorateUserPermissions,
  findUserPermissionIndex,
} from '../../../middleware/auth';
import updateOrg, { checkOrgExists } from './service';
import { AuthorizationError, OrgNotFoundError } from '../../../constants/errors';

export const validationSchema = {
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
    name: Joi.string()
      .trim()
      .min(3)
      .max(100)
      .optional(),
    slug: Joi.string()
      .lowercase()
      .trim()
      .min(3)
      .max(30)
      .optional()
      .regex(/^[A-Za-z0-9\-_]*$/, { name: 'slug' }),
  },
};

const doesRequestedOrgExist = async (ctx, next) => {
  const { request } = ctx;
  const org = await checkOrgExists(ctx, request.body.id);

  if (!org) {
    throw new OrgNotFoundError(`Org ${request.body.id} cannot be found`);
  }

  await next();
};

const isUserAuthorized = async ({ request }, next) => {
  const hasPermission = Array.from(new Set([request.body.id, null])).some(
    (orgId) =>
      findUserPermissionIndex(request.session.user.permissions, {
        name: 'yeep.role.write',
        orgId,
      }) !== -1
  );

  if (!hasPermission) {
    throw new AuthorizationError(
      `User ${request.session.user.id} does not have sufficient permissions to access this resource`
    );
  }

  await next();
};

async function handler(ctx) {
  const { request, response } = ctx;
  const { id: orgId, name, slug } = request.body;

  // ensure name or slug have been specified
  if (!(name || slug)) {
    const boom = Boom.badRequest('Invalid request body');
    boom.output.payload.details = [
      {
        path: ['name'],
        type: 'any.required',
      },
    ];
    throw boom;
  }

  const org = await updateOrg(ctx, orgId, {
    name,
    slug,
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
  decorateUserPermissions(),
  doesRequestedOrgExist,
  isUserAuthorized,
  handler,
]);
