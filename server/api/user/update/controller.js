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
import { updateUser } from './service';
import { AuthorizationError } from '../../../constants/errors';
import * as authFactorTypes from '../../../constants/authFactorTypes';

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
    secondaryAuthFactor: Joi.object({
      type: Joi.string()
        .valid(Object.values(authFactorTypes))
        .required(),
      token: Joi.string()
        .min(6)
        .max(50)
        .required(),
    }).optional(),
  },
};

const isUserAuthorized = async ({ request }, next) => {
  const isUserRequestorIdentical = request.session.user.id === request.body.id;
  const isRequestorSuperUser =
    findUserPermissionIndex(request.session.user.permissions, {
      name: 'yeep.user.write',
      orgId: null, // i.e. global scope
    }) !== -1;

  if (!(isUserRequestorIdentical || isRequestorSuperUser)) {
    throw new AuthorizationError(
      `User ${request.session.user.id} is not authorized to perform this action`
    );
  }

  // only superusers are allowed to set emails as verified
  if (
    !isRequestorSuperUser &&
    request.body.emails &&
    request.body.emails.some((email) => !isUndefined(email.isVerified))
  ) {
    const boom = Boom.badRequest('Invalid request body');
    boom.output.payload.details = [
      {
        path: ['emails', 'isVerified'],
        type: 'any.unknown',
        message: '"isVerified" is not allowed',
      },
    ];
    throw boom;
  }

  await next();
};

const ensureSomeUserPropSpecified = async ({ request }, next) => {
  const { username, password, fullName, picture, emails } = request.body;

  // ensure at least one user property has been specified
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

  await next();
};

const ensureUsernameAllowed = async ({ request, config }, next) => {
  const { isUsernameEnabled } = config;
  const { username } = request.body;

  if (username && !isUsernameEnabled) {
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

async function handler(ctx) {
  const { request, response } = ctx;
  const user = await updateUser(ctx, {
    ...request.body,
    isMFARequired: request.session.user.id === request.body.id,
  });

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
  ensureSomeUserPropSpecified,
  ensureUsernameAllowed,
  decorateUserPermissions(),
  isUserAuthorized,
  handler,
]);
