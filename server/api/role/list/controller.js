import Joi from 'joi';
import compose from 'koa-compose';
import last from 'lodash/last';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  decorateSession,
  isUserAuthenticated,
  decorateUserPermissions,
  getAuthorizedUniqueOrgIds,
  findUserPermissionIndex,
} from '../../../middleware/auth';
import { AuthorizationError } from '../../../constants/errors';
import listRoles, { parseCursor, stringifyCursor } from './service';

export const validationSchema = {
  body: {
    q: Joi.string()
      .trim()
      .max(2000)
      .optional(),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(500)
      .default(100)
      .optional(),
    cursor: Joi.string()
      .base64()
      .optional(),
    scope: Joi.string()
      .base64()
      .optional(),
    isSystemRole: Joi.boolean().optional(),
  },
};

const isUserAuthorised = async ({ request }, next) => {
  // verify a user has access to the requested org
  if (request.body.scope) {
    const isScopeAccessible =
      findUserPermissionIndex(request.session.user.permissions, {
        name: 'yeep.role.read',
        orgId: request.body.scope,
      }) !== -1;

    if (!isScopeAccessible) {
      throw new AuthorizationError(
        `User ${
          request.session.user.id
        } does not have sufficient permissions to list roles under org ${request.body.scope}`
      );
    }
  }

  await next();
};

async function handler(ctx) {
  const { request, response } = ctx;
  const { q, limit, cursor, isSystemRole, scope } = request.body;

  const { roles, roleCount } = await listRoles(ctx, {
    q,
    limit,
    cursor: cursor ? parseCursor(cursor) : null,
    scopes: scope ? [scope] : getAuthorizedUniqueOrgIds(request, 'yeep.role.read'),
    isSystemRole,
  });

  response.status = 200; // OK
  response.body = {
    roles,
    roleCount,
    nextCursor: roles.length < limit ? undefined : stringifyCursor(last(roles)),
  };
}

export default compose([
  packJSONRPC,
  decorateSession(),
  isUserAuthenticated(),
  validateRequest(validationSchema),
  decorateUserPermissions(),
  isUserAuthorised,
  handler,
]);
