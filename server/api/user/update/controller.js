import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  decorateSession,
  isUserAuthenticated,
  decorateUserPermissions,
  findUserPermissionIndex,
} from '../../../middleware/auth';
import { getUserAndVerifyPassword } from '../../session/create/service';
import updateUser from './service';
import getUserInfo from '../info/service';
import { AuthorizationError } from '../../../constants/errors';

export const validationSchema = {
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
    username: Joi.string()
      .lowercase()
      .trim()
      .min(2)
      .max(30)
      .optional()
      .regex(/^[A-Za-z0-9_\-.]*$/, { name: 'username' }),
    oldPassword: Joi.string()
      .trim()
      .min(8)
      .max(50)
      .optional(),
    password: Joi.string()
      .trim()
      .min(8)
      .max(50)
      .optional(),
    fullName: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .optional(),
    picture: Joi.string()
      .allow(null)
      .uri({ scheme: ['http', 'https'] })
      .trim()
      .max(500)
      .optional(),
    emails: Joi.array()
      .items(
        Joi.object()
          .unknown(false)
          .keys({
            address: Joi.string()
              .trim()
              .email()
              .max(100)
              .required(),
            isVerified: Joi.boolean().optional(),
            isPrimary: Joi.boolean()
              .default(false)
              .optional(),
          })
          .required()
      )
      .min(1)
      .max(10)
      .unique((a, b) => a.address === b.address)
      .optional(),
  },
};

const isRequestorAllowedToEditUser = (requestorPermissions, orgId) => {
  const hasUserReadPermissions =
    findUserPermissionIndex(requestorPermissions, {
      name: 'yeep.user.write',
      orgId,
    }) !== -1;

  return hasUserReadPermissions;
};

const isUserAuthorized = async ({ request }, next) => {
  const isUserRequestorIdentical = request.session.user.id === request.body.id;
  const hasPermission = Array.from(new Set([...request.session.requestedUser.orgs, null])).some(
    (orgId) => isRequestorAllowedToEditUser(request.session.user.permissions, orgId)
  );

  if (!isUserRequestorIdentical && !hasPermission) {
    throw new AuthorizationError(
      `User ${request.session.user.id} does not have sufficient permissions to access this resource`
    );
  }

  await next();
};

const isUserAllowed = async (ctx, next) => {
  const { db, request, config } = ctx;
  const { isUsernameEnabled } = config;
  const { username, password, oldPassword, fullName, picture, emails } = request.body;

  const isSuperUser =
    findUserPermissionIndex(request.session.user.permissions, {
      name: 'yeep.user.write',
      orgId: '',
    }) !== -1;

  // only a superuser can change a password without having the old one
  if (!isSuperUser && password && !oldPassword) {
    const boom = Boom.badRequest('Invalid request body');
    boom.output.payload.details = [
      {
        path: ['oldPassword'],
        type: 'any.required',
      },
    ];
    throw boom;
  }

  // also check if user is superuser
  if (!isSuperUser && password) {
    await getUserAndVerifyPassword(
      { db },
      {
        username: request.session.requestedUser.username,
        password: oldPassword,
      }
    );
  }

  // only superusers are allowed to set emails as verified
  if (!isSuperUser && emails) {
    const containsVerifiedProperty = emails.some((email) => !isUndefined(email.isVerified));
    if (containsVerifiedProperty) {
      const boom = Boom.badRequest('Invalid request body');
      boom.output.payload.details = [
        {
          path: ['emails.isVerified'],
          type: 'any.unknown',
          message: '"isVerified" is not allowed',
        },
      ];
      throw boom;
    }
  }

  // ensure either user property has been specified
  if (!(username || password || fullName || picture || isNull(picture) || emails)) {
    const boom = Boom.badRequest('Invalid request body');
    boom.output.payload.details = [
      {
        path: ['fullName'],
        type: 'any.required',
      },
    ];
    throw boom;
  }

  if (request.body.username && !isUsernameEnabled) {
    const boom = Boom.badRequest('Invalid request body');
    boom.output.payload.details = [
      {
        path: ['username'],
        type: 'any.forbidden',
      },
    ];
    throw boom;
  }

  await next();
};

const decorateRequestedUser = async (ctx, next) => {
  const { request } = ctx;
  const user = await getUserInfo(ctx, request.body);

  // decorate session object with requested user data
  request.session = {
    ...request.session,
    requestedUser: user,
  };

  await next();
};

async function handler(ctx) {
  const { request, response } = ctx;
  const user = await updateUser(ctx, request.session.requestedUser, request.body);

  response.status = 200; // OK
  response.body = {
    user,
  };
}

export default compose([
  packJSONRPC,
  decorateSession(),
  isUserAuthenticated(),
  validateRequest(validationSchema),
  decorateUserPermissions(),
  decorateRequestedUser,
  isUserAuthorized,
  isUserAllowed,
  handler,
]);
