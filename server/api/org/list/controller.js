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
import { parseCursor, stringifyCursor, getOrgs, getOrgsCount } from './service';
import * as SortedUserPermissionArray from '../../../utils/SortedUserPermissionArray';

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

async function isUserAuthorised({ request }, next) {
  const requestor = request.session.user;

  // ensure requestor can read orgs
  const hasOrgReadPermission = SortedUserPermissionArray.includes(requestor.permissions, {
    name: 'yeep.org.read',
  });

  if (!hasOrgReadPermission) {
    throw new AuthorizationError(`User ${request.session.user.id} is not allowed to list orgs`);
  }

  // ensure requestor has access to the specified user
  if (request.body.user) {
    const isUserRequestorIdentical = request.session.user.id === request.body.user;
    const hasUserReadPermissions = SortedUserPermissionArray.includes(requestor.permissions, {
      name: 'yeep.user.read',
    });
    const hasPermissionsAssignmentRead = SortedUserPermissionArray.includes(requestor.permissions, {
      name: 'yeep.permission.assignment.read',
    });
    const hasRoleAssignmentRead = SortedUserPermissionArray.includes(requestor.permissions, {
      name: 'yeep.role.assignment.read',
    });

    const hasPermission =
      isUserRequestorIdentical ||
      (hasUserReadPermissions && (hasPermissionsAssignmentRead || hasRoleAssignmentRead));

    if (!hasPermission) {
      throw new AuthorizationError(
        `User ${request.session.user.id} is not allowed to access the orgs of user ${
          request.body.user
        }`
      );
    }
  }

  await next();
}

async function handler(ctx) {
  const { request, response } = ctx;
  const { q, limit, user, cursor } = request.body;
  const requestor = request.session.user;

  const orgScope = SortedUserPermissionArray.includes(requestor.permissions, {
    name: 'yeep.org.read',
    orgId: null,
  })
    ? []
    : SortedUserPermissionArray.getUniqueOrgIds(requestor.permissions, { name: 'yeep.org.read' });

  const cursorObj = cursor ? parseCursor(cursor) : null;

  const [orgs, orgsCount] = await Promise.all([
    getOrgs(ctx, {
      q,
      limit,
      cursor: cursorObj,
      orgScope,
      user,
    }),
    getOrgsCount(ctx, {
      q,
      orgScope,
      user,
    }),
  ]);

  response.status = 200; // OK
  response.body = {
    orgsCount,
    orgs,
    nextCursor: orgs.length < limit ? undefined : stringifyCursor(last(orgs)),
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
