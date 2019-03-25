import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import isemail from 'isemail';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import inviteUser, { defaultTokenExpiresInSeconds } from './service';
import {
  findUserPermissionIndex,
  decorateUserPermissions,
  decorateSession,
  isUserAuthenticated,
} from '../../../middleware/auth';
import { AuthorizationError } from '../../../constants/errors';

export const validationSchema = {
  body: {
    user: Joi.alternatives().try([
      Joi.string()
        .lowercase()
        .trim()
        .min(2)
        .max(30)
        .required()
        .regex(/^[A-Za-z0-9_\-.]*$/, { name: 'username' }),
      Joi.string()
        .trim()
        .email()
        .max(100)
        .required(),
    ]),
    org: Joi.string()
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
    tokenExpiresInSeconds: Joi.number()
      .integer()
      .min(0)
      .max(30 * 24 * 60 * 60) // i.e. 30 days
      .optional()
      .default(defaultTokenExpiresInSeconds), // i.e. 1 week
  },
};

const decorateUserPropType = async ({ request }, next) => {
  const { user } = request.body;

  // check if user prop is email
  const isUserPropEmail = isemail.validate(user);

  // decorate session object
  request.session = {
    ...request.session,
    isUserPropEmail,
  };

  await next();
};

const isUserPropValid = async ({ request, config }, next) => {
  const { isUsernameEnabled } = config;
  const { isUserPropEmail } = request.session;

  // ensure userKey is email formatted - OR - username is enabled
  if (!isUserPropEmail && !isUsernameEnabled) {
    const boom = Boom.badRequest('Invalid request body');
    boom.output.payload.details = [
      {
        path: ['user'],
        type: 'string.email',
      },
    ];
    throw boom;
  }

  await next();
};

const isUserAuthorized = async ({ request }, next) => {
  if (request.body.permissions.length !== 0) {
    const hasPermission = [request.body.org, null].some(
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
    const hasPermission = [request.body.org, null].some(
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

  const hasPermission = [request.body.org, null].some(
    (orgId) =>
      findUserPermissionIndex(request.session.user.permissions, {
        name: 'yeep.invitation.write',
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

async function handler({ request, response, db, bus }) {
  const { org, user, permissions, roles, tokenExpiresInSeconds } = request.body;
  const { user: inviter, isUserPropEmail } = request.session;
  const UserModel = db.model('User');

  // initiate password reset process
  const isUserInvited = await inviteUser(db, bus, {
    orgId: org,
    permissions,
    roles,
    tokenExpiresInSeconds,
    inviterId: inviter.id,
    inviterUsername: inviter.username,
    inviterFullName: inviter.fullName,
    inviterPicture: inviter.picture,
    inviterEmailAddress: UserModel.getPrimaryEmailAddress(inviter.emails),
    ...(isUserPropEmail
      ? {
          inviteeEmailAddress: user,
        }
      : {
          inviteeUsername: user,
        }),
  });

  if (!isUserInvited) {
    throw Boom.internal();
  }

  response.status = 200; // OK
}

export default compose([
  packJSONRPC,
  decorateSession(),
  isUserAuthenticated(),
  validateRequest(validationSchema),
  decorateUserPropType,
  isUserPropValid,
  decorateUserPermissions(),
  isUserAuthorized,
  handler,
]);
