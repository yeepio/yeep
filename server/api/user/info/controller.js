import Joi from 'joi';
import compose from 'koa-compose';
import mapValues from 'lodash/mapValues';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  visitSession,
  isUserAuthenticated,
  visitUserPermissions,
  findUserPermissionIndex,
} from '../../../middleware/auth';
import getUserInfo, { defaultProjection } from './service';
import { AuthorizationError } from '../../../constants/errors';

export const validationSchema = {
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
    projection: Joi.object(
      mapValues(defaultProjection, (value) =>
        Joi.boolean()
          .optional()
          .default(value)
      )
    )
      .optional()
      .default(defaultProjection),
  },
};

const isUserAuthorized = async ({ request }, next) => {
  const isUserRequestorIdentical = request.session.user.id === request.body.id;
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
      }" does not have sufficient permissions to access this resource`
    );
  }

  await next();
};

const visitRequestedUser = async ({ request, db }, next) => {
  const user = await getUserInfo(db, request.body);

  // visit session object with requested user data
  request.session = {
    ...request.session,
    requestedUser: user,
  };

  await next();
};

async function handler({ request, response }) {
  response.status = 200; // OK
  response.body = {
    user: request.session.requestedUser,
  };
}

export default compose([
  packJSONRPC,
  visitSession(),
  isUserAuthenticated(),
  validateRequest(validationSchema),
  visitRequestedUser,
  visitUserPermissions(),
  isUserAuthorized,
  handler,
]);
