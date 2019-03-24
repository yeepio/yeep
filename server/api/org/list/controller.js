import Joi from 'joi';
import compose from 'koa-compose';
import last from 'lodash/last';
import intersection from 'lodash/intersection';
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
import getUserInfo from '../../user/info/service';
import listOrgs, { parseCursor, stringifyCursor } from './service';

const validationSchema = {
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
    user: Joi.string()
      .base64()
      .optional(),
  },
};

const isRequestorAllowedToReadUsers = (requestorPermissions, orgId) => {
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

// if requestor contains the null org (superuser) then they can access all of the users scopes.
const getIntersectingScopes = (requestorScope, userScope) => {
  if (requestorScope.includes(null)) {
    return userScope;
  }

  return intersection(requestorScope, userScope);
};

const isUserAuthorised = async ({ request }, next) => {
  // verify a user has access to the requested user
  if (request.body.user) {
    const isUserRequestorIdentical = request.session.user.id === request.body.user;
    const hasPermission = Array.from(new Set([...request.session.requestedUser.orgs, null])).some(
      (orgId) => isRequestorAllowedToReadUsers(request.session.user.permissions, orgId)
    );

    if (!isUserRequestorIdentical && !hasPermission) {
      throw new AuthorizationError(
        `User "${request.session.user.id}" is not allowed to list orgs that user "${
          request.body.user
        }" is member of`
      );
    }
  }

  await next();
};

const decorateRequestedUser = async ({ request, db }, next) => {
  if (request.body.user) {
    const user = await getUserInfo(db, { id: request.body.user });

    // decorate session object with requested user data
    request.session = {
      ...request.session,
      requestedUser: user,
    };
  }

  await next();
};

/*
 * Authorisation Logic:
 *
 * When `user` body param is NOT specified.
 * 1.1. Retrieve orgs for which requestor has `yeep.org.read` permission.
 *      Please note null implies all orgs (superuser).
 * 1.2. Return orgs.
 *
 * When `user` body param is specified.
 * 2.1. Retrieve orgs that the designated user is member of.
 * 2.2. Check if requestor has`yeep.user.read AND (yeep.permission.assignment.read OR yeep.role.assignment.read)`
 *      in global scope (null) or at least 1 org from the user's orgs.
 *      Otherwise return error since the requestor cannot access the specified user.
 * 2.3. Return orgs that are the intersection between requestor orgs and user orgs.
 */
async function handler(ctx) {
  const { request, response } = ctx;
  const { q, limit, user, cursor } = request.body;
  const scopes = getAuthorizedUniqueOrgIds(request, 'yeep.org.read');
  const orgs = await listOrgs(ctx, {
    q,
    limit,
    cursor: cursor ? parseCursor(cursor) : null,
    scopes: user ? getIntersectingScopes(scopes, request.session.requestedUser.orgs) : scopes,
  });

  response.status = 200; // OK
  response.body = {
    orgs,
    nextCursor: orgs.length < limit ? undefined : stringifyCursor(last(orgs)),
  };
}

export default compose([
  packJSONRPC,
  decorateSession(),
  isUserAuthenticated(),
  validateRequest(validationSchema),
  decorateUserPermissions(),
  decorateRequestedUser,
  isUserAuthorised,
  handler,
]);
