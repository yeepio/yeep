import Joi from 'joi';
import compose from 'koa-compose';
import last from 'lodash/last';
import mapValues from 'lodash/mapValues';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  decorateSession,
  isUserAuthenticated,
  populateUserPermissions,
} from '../../../middleware/auth';
import { AuthorizationError } from '../../../constants/errors';
import * as SortedUserPermissionArray from '../../../utils/SortedUserPermissionArray';
import { parseCursor, stringifyCursor, defaultProjection, getUsers, getUserCount } from './service';

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

async function isUserAuthorised({ request }, next) {
  const requestor = request.session.user;

  // ensure requestor can read users
  const hasAnyUserReadPermission = SortedUserPermissionArray.includes(requestor.permissions, {
    name: 'yeep.user.read',
  });

  if (!hasAnyUserReadPermission) {
    throw new AuthorizationError(`User ${request.session.user.id} is not allowed to list users`);
  }

  // ensure requestor has access to the specified org
  if (request.body.org) {
    const hasUserReadPermissions =
      SortedUserPermissionArray.includes(requestor.permissions, {
        name: 'yeep.user.read',
        orgId: request.body.org,
      }) ||
      SortedUserPermissionArray.includes(requestor.permissions, {
        name: 'yeep.user.read',
        orgId: null,
      });
    const hasPermissionsAssignmentRead =
      SortedUserPermissionArray.includes(requestor.permissions, {
        name: 'yeep.permission.assignment.read',
        orgId: request.body.org,
      }) ||
      SortedUserPermissionArray.includes(requestor.permissions, {
        name: 'yeep.permission.assignment.read',
        orgId: null,
      });
    const hasRoleAssignmentRead =
      SortedUserPermissionArray.includes(requestor.permissions, {
        name: 'yeep.role.assignment.read',
        orgId: request.body.org,
      }) ||
      SortedUserPermissionArray.includes(requestor.permissions, {
        name: 'yeep.role.assignment.read',
        orgId: null,
      });

    const hasPermission =
      hasUserReadPermissions && (hasPermissionsAssignmentRead || hasRoleAssignmentRead);

    if (!hasPermission) {
      throw new AuthorizationError(
        `User ${request.session.user.id} is not allowed to list users under org ${request.body.org}`
      );
    }
  }

  await next();
}

async function handler(ctx) {
  const { request, response } = ctx;
  const { q, limit, cursor, projection, org } = request.body;
  const requestor = request.session.user;

  const orgScope = org
    ? [org]
    : SortedUserPermissionArray.includes(requestor.permissions, {
        name: 'yeep.org.read',
        orgId: null,
      })
    ? []
    : SortedUserPermissionArray.getUniqueOrgIds(requestor.permissions, { name: 'yeep.user.read' });

  const [users, userCount] = await Promise.all([
    getUsers(ctx, {
      q,
      limit,
      cursor: cursor ? parseCursor(cursor) : null,
      orgScope,
      projection,
    }),
    getUserCount(ctx, {
      q,
      orgScope,
    }),
  ]);

  response.status = 200; // OK
  response.body = {
    userCount,
    users,
    nextCursor: users.length < limit ? undefined : stringifyCursor(last(users)),
  };
}

export default compose([
  packJSONRPC,
  decorateSession(),
  isUserAuthenticated(),
  validateRequest(validationSchema),
  populateUserPermissions,
  isUserAuthorised,
  handler,
]);
