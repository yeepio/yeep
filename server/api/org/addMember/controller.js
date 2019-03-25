import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  findUserPermissionIndex,
  decorateUserPermissions,
  decorateSession,
  isUserAuthenticated,
} from '../../../middleware/auth';
import { AuthorizationError } from '../../../constants/errors';
import addMemberToOrg from './service';

export const validationSchema = {
  body: {
    userId: Joi.string()
      .length(24)
      .hex()
      .required(),
    orgId: Joi.string()
      .length(24)
      .hex()
      .required(),
    permissions: Joi.array()
      .items(
        Joi.object()
          .unknown(false)
          .keys({
            id: Joi.string()
              .length(24)
              .hex()
              .required(),
            resourceId: Joi.alternatives()
              .try(
                Joi.number(),
                Joi.string()
                  .trim()
                  .min(2)
                  .max(140)
              )
              .optional(),
          })
          .required()
      )
      .min(1)
      .max(100)
      .single()
      .unique()
      .optional()
      .default([]),
    roles: Joi.array()
      .items(
        Joi.object()
          .unknown(false)
          .keys({
            id: Joi.string()
              .length(24)
              .hex()
              .required(),
            resourceId: Joi.alternatives()
              .try(
                Joi.number(),
                Joi.string()
                  .trim()
                  .min(2)
                  .max(140)
              )
              .optional(),
          })
          .required()
      )
      .min(1)
      .max(100)
      .single()
      .unique()
      .optional()
      .default([]),
    expiresInSeconds: Joi.number()
      .integer()
      .min(0)
      .max(30 * 24 * 60 * 60) // i.e. 30 days
      .optional(),
  },
};

const isUserAuthorized = async ({ request }, next) => {
  if (request.body.permissions.length !== 0) {
    const hasPermission = [request.body.orgId, null].some(
      (orgId) =>
        findUserPermissionIndex(request.session.user.permissions, {
          name: 'yeep.permission.assignment.write',
          orgId,
        }) !== -1
    );

    if (!hasPermission) {
      throw new AuthorizationError(
        `User ${
          request.session.user.id
        } does not have sufficient permissions to access this resource`
      );
    }
  }

  if (request.body.roles.length !== 0) {
    const hasPermission = [request.body.orgId, null].some(
      (orgId) =>
        findUserPermissionIndex(request.session.user.permissions, {
          name: 'yeep.role.assignment.write',
          orgId,
        }) !== -1
    );

    if (!hasPermission) {
      throw new AuthorizationError(
        `User ${
          request.session.user.id
        } does not have sufficient permissions to access this resource`
      );
    }
  }

  const hasPermission = [request.body.orgId, null].some(
    (orgId) =>
      findUserPermissionIndex(request.session.user.permissions, {
        name: 'yeep.user.write',
        orgId,
      }) !== -1
  );

  if (!hasPermission) {
    throw new AuthorizationError(
      `User ${request.session.user.id} does not have sufficient permissions to access this resource`
    );
  }

  await next();
};

async function handler({ request, response, db }) {
  const isMemberAdded = await addMemberToOrg(db, request.body);

  if (!isMemberAdded) {
    throw Boom.internal();
  }

  response.status = 200; // OK
}

export default compose([
  packJSONRPC,
  decorateSession(),
  isUserAuthenticated(),
  validateRequest(validationSchema),
  decorateUserPermissions(),
  isUserAuthorized,
  handler,
]);
