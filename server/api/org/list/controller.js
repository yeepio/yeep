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

const isUserAuthorised = async ({ request }, next) => {
  // verify a user has access to the requested user
  if (request.body.user) {
    const isUserRequestorIdentical = request.session.user.id === request.body.user;
    const hasPermission = Array.from(new Set([...request.session.requestedUser.orgs, null])).some(
      (orgId) =>
        findUserPermissionIndex(request.session.user.permissions, {
          name: 'yeep.user.read',
          orgId,
        }) !== -1 &&
        (request.body.projection.permissions
          ? findUserPermissionIndex(request.session.user.permissions, {
              name: 'yeep.permission.assignment.read',
              orgId,
            }) !== -1
          : true) &&
        (request.body.projection.roles
          ? findUserPermissionIndex(request.session.user.permissions, {
              name: 'yeep.role.assignment.read',
              orgId,
            }) !== -1
          : true)
    );

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

async function handler({ request, response, db }) {
  const { q, limit, cursor } = request.body;

  const orgs = await listOrgs(db, {
    q,
    limit,
    cursor: cursor ? parseCursor(cursor) : null,
    scopes: getAuthorizedUniqueOrgIds(request, 'yeep.org.read'),
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
