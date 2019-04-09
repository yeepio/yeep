import Joi from 'joi';
import compose from 'koa-compose';
import last from 'lodash/last';
import mapValues from 'lodash/mapValues';
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
import listUsers, { parseCursor, stringifyCursor, defaultProjection } from './service';

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
    projection: Joi.object(
      mapValues(defaultProjection, (value) =>
        Joi.boolean()
          .optional()
          .default(value)
      )
    )
      .optional()
      .default(defaultProjection),
    org: Joi.string()
      .base64()
      .optional(),
  },
};

const isRequestorAllowedToReadOrgs = (requestorPermissions, orgId) => {
  const hasUserReadPermissions =
    findUserPermissionIndex(requestorPermissions, {
      name: 'yeep.user.read',
      orgId,
    }) !== -1;
  const hasPermissionsAssignmentRead =
    findUserPermissionIndex(requestorPermissions, {
      name: 'yeep.permission.assignment.read',
      orgId,
    }) !== -1;
  const hasRoleAssignmentRead =
    findUserPermissionIndex(requestorPermissions, {
      name: 'yeep.role.assignment.read',
      orgId,
    }) !== -1;

  return hasUserReadPermissions && (hasPermissionsAssignmentRead || hasRoleAssignmentRead);
};

const isUserAuthorised = async ({ request }, next) => {
  // verify a user has access to the requested org
  if (request.body.org) {
    const isScopeAccessible = isRequestorAllowedToReadOrgs(request.session.user.permissions, request.body.org);

    if (!isScopeAccessible) {
      throw new AuthorizationError(
        `User ${
          request.session.user.id
        } does not have sufficient permissions to list users under org ${request.body.org}`
      );
    }
  }

  await next();
};

async function handler(ctx) {
  const { request, response } = ctx;
  const { q, limit, cursor, projection, org } = request.body;

  const users = await listUsers(ctx, {
    q,
    limit,
    cursor: cursor ? parseCursor(cursor) : null,
    scopes: org ? [org] : getAuthorizedUniqueOrgIds(request, 'yeep.user.read'),
    projection,
  });

  response.status = 200; // OK
  response.body = {
    users,
    nextCursor: users.length < limit ? undefined : stringifyCursor(last(users)),
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
