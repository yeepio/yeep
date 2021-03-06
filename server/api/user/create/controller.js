import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  decorateSession,
  isUserAuthenticated,
  decorateUserPermissions,
  findUserPermissionIndex,
} from '../../../middleware/auth';
import createUser from './service';
import { AuthorizationError } from '../../../constants/errors';

export const validationSchema = {
  body: {
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
      .required(),
    fullName: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .required(),
    picture: Joi.string()
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
            isVerified: Joi.boolean()
              .default(false)
              .optional(),
            isPrimary: Joi.boolean()
              .default(false)
              .optional(),
          })
          .required()
      )
      .min(1)
      .max(10)
      .unique((a, b) => a.address === b.address)
      .required(),
    orgs: Joi.array()
      .items(
        Joi.string()
          .length(24)
          .hex()
      )
      .min(1)
      .max(10)
      .single()
      .unique()
      .default([])
      .optional(),
  },
};

const isUserAuthorized = async ({ request }, next) => {
  const hasPermission =
    findUserPermissionIndex(request.session.user.permissions, {
      name: 'yeep.user.write',
      orgId: null,
    }) !== -1;

  if (!hasPermission) {
    throw new AuthorizationError(
      `User ${request.session.user.id} does not have sufficient permissions to access this resource`
    );
  }

  await next();
};

async function handler({ request, response, db, config }) {
  const { isUsernameEnabled } = config;

  if (isUsernameEnabled && !request.body.username) {
    const boom = Boom.badRequest('Invalid request body');
    boom.output.payload.details = [
      {
        path: ['username'],
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

  const user = await createUser({ db }, request.body);

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
  isUserAuthorized,
  handler,
]);
