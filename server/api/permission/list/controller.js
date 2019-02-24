import Joi from 'joi';
import compose from 'koa-compose';
import last from 'lodash/last';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  visitSession,
  isUserAuthenticated,
  visitUserPermissions,
  getAuthorizedUniqueOrgIds,
  findUserPermissionIndex,
} from '../../../middleware/auth';
import { AuthorizationError } from '../../../constants/errors';
import getRoleInfo from '../../role/info/service';
import listPermissions, { parseCursor, stringifyCursor } from './service';

const validation = validateRequest({
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
    role: Joi.string()
      .base64()
      .optional(),
    isSystemPermission: Joi.boolean()
      .optional(),
  },
});

const visitRequestedRole = async ({ request, db }, next) => {
  const roleId = request.body.role;
  if (roleId) {
    const role = await getRoleInfo(db, { id: roleId });

    // visit session with requested role data
    request.session = {
      ...request.session,
      role,
    };
  }
  await next();
};

const isUserAuthorised = async ({ request }, next) => {
  // verify a user has access to the requested org
  if (request.body.scope) {
    const isScopeAccessible = findUserPermissionIndex(request.session.user.permissions, {
      name: 'yeep.role.read',
      orgId: request.body.scope,
    }) !== -1;

    if (!isScopeAccessible) {
      throw new AuthorizationError(
        `User "${
          request.session.user.username
        }" does not have sufficient permissions to list permissions under org ${request.body.scope}`
      );
    }
  }

  if (request.body.role) {
    const hasPermission = Array.from(new Set([request.session.role.scope, null])).some(
      (orgId) =>
        findUserPermissionIndex(request.session.user.permissions, {
          name: 'yeep.role.read',
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
  }

  await next();
};

async function handler({ request, response, db }) {
  const { q, limit, cursor, scope, isSystemPermission } = request.body;

  const permissions = await listPermissions(db, {
    q,
    limit,
    cursor: cursor ? parseCursor(cursor) : null,
    scopes: scope ? [scope] : getAuthorizedUniqueOrgIds(request, 'yeep.permission.read'),
    role: request.session.role,
    isSystemPermission,
  });

  response.status = 200; // OK
  response.body = {
    permissions,
    nextCursor: permissions.length < limit ? undefined : stringifyCursor(last(permissions)),
  };
}

export default compose([
  packJSONRPC,
  visitSession(),
  isUserAuthenticated(),
  validation,
  visitUserPermissions(),
  visitRequestedRole,
  isUserAuthorised,
  handler,
]);
