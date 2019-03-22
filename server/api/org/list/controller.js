import Joi from 'joi';
import compose from 'koa-compose';
import last from 'lodash/last';
import intersection from 'lodash/intersection';
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
  const hasUserReadPermissions = findUserPermissionIndex(requestorPermissions, {
    name: 'yeep.user.read',
    orgId,
  }) !== -1;
  const hasPermissionsAssignmentRead = findUserPermissionIndex(requestorPermissions, {
    name: 'yeep.permission.assignment.read',
    orgId,
  }) !== -1;

  const hasRoleAssignmentRead = findUserPermissionIndex(requestorPermissions, {
    name: 'yeep.role.assignment.read',
    orgId,
  }) !== -1;

  return hasUserReadPermissions && (hasPermissionsAssignmentRead || hasRoleAssignmentRead);
}

// if a requestor contains the null org (superuser)  then they can access all of the users scopes.
const getIntersectingScopes = (requestorScope, userScope) => {
  if (requestorScope.includes(null)) {
    return userScope;
  }

  return intersection(requestorScope, userScope);
}

const isUserAuthorised = async ({ request }, next) => {
  // verify a user has access to the requested user
  if (request.body.user) {
    const isUserRequestorIdentical = request.session.user.id === request.body.user;
    const hasPermission = Array.from(new Set([...request.session.requestedUser.orgs, null])).some(
      (orgId) => isRequestorAllowedToReadUsers(request.session.user.permissions, orgId));

    if (!isUserRequestorIdentical && !hasPermission) {
      throw new AuthorizationError(
        `User "${
          request.session.user.username
        }" does not have sufficient permissions to list orgs under user ${request.body.user}`
      );
    }
  }

  await next();
};

const visitRequestedUser = async ({ request, db }, next) => {
  if (request.body.user) {
    const user = await getUserInfo(db, { id: request.body.user });

    // visit session object with requested user data
    request.session = {
      ...request.session,
      requestedUser: user,
    };
  }

  await next();
};

/*
**  Authorisation Logic
**  1. User param is not specified
**    i. Retrieve all orgs requestor has yeep.org.read permission.
**       Please note null implies all orgs (superuser),
**    ii. Returns orgs
**
**  2. User param is specified
**    i. Retrieve user orgs by user body param.
**    ii. Check if requestor has yeep.user.read AND 
**        (yeep.permission.assignment.read OR yeep.role.assignment.read)
*         in global scope (null) or at least 1 org from the user's orgs. 
*         Otherwise return error since the requestor cannot access the specified user.
**    iii. Return orgs that are the intersection between requestor orgs and user orgs.
 */
async function handler({ request, response, db }) {
  const { q, limit, user, cursor } = request.body;
  const scopes = getAuthorizedUniqueOrgIds(request, 'yeep.org.read');
  const orgs = await listOrgs(db, {
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
  visitSession(),
  isUserAuthenticated(),
  validateRequest(validationSchema),
  visitUserPermissions(),
  visitRequestedUser,
  isUserAuthorised,
  handler,
]);
