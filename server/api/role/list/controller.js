import Joi from 'joi';
import compose from 'koa-compose';
import last from 'lodash/last';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  decorateSession,
  isUserAuthenticated,
  populateUserPermissions,
} from '../../../middleware/auth';
import { AuthorizationError } from '../../../constants/errors';
import { parseCursor, stringifyCursor, getRoles, getRoleCount } from './service';
import * as SortedUserPermissionArray from '../../../utils/SortedUserPermissionArray';

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

const isUserAuthorized = async ({ request }, next) => {
  const requestor = request.session.user;

  // verify a user has access to the requested org
  if (request.body.scope) {
    const isScopeAccessible = [request.body.scope, null].some((orgId) =>
      SortedUserPermissionArray.includes(requestor.permissions, {
        name: 'yeep.role.read',
        orgId,
      })
    );

    if (!isScopeAccessible) {
      throw new AuthorizationError(
        `User ${request.session.user.id} is not authorized to list roles under org ${
          request.body.scope
        }`
      );
    }
  }

  await next();
};

async function handler(ctx) {
  const { request, response } = ctx;
  const { q, limit, isSystemRole, scope, cursor } = request.body;

  const orgScope = scope
    ? [scope]
    : SortedUserPermissionArray.getUniqueOrgIds(request.session.user.permissions, {
        name: 'yeep.role.read',
      });
  const cursorObj = cursor ? parseCursor(cursor) : null;

  const [roles, roleCount] = await Promise.all([
    getRoles(ctx, {
      q,
      limit,
      cursor: cursorObj,
      orgScope,
      isSystemRole,
    }),
    getRoleCount(ctx, {
      q,
      orgScope,
      isSystemRole,
    }),
  ]);

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
  populateUserPermissions,
  isUserAuthorized,
  handler,
]);
