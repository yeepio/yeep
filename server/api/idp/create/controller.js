import Joi from 'joi';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import { createIdentityProvider } from './service';
import {
  findUserPermissionIndex,
  decorateUserPermissions,
  decorateSession,
  isUserAuthenticated,
} from '../../../middleware/auth';
import { AuthorizationError } from '../../../constants/errors';
import * as idpTypes from '../../../constants/idpTypes';
import { OAUTH } from '../../../constants/idpProtocols';

export const validationSchema = {
  body: {
    org: Joi.string()
      .length(24)
      .hex()
      .optional(),
    type: Joi.string()
      .valid(Object.keys(idpTypes))
      .required(),
    protocol: Joi.string()
      .valid([OAUTH])
      .required(),
    clientId: Joi.when('protocol', {
      is: OAUTH,
      then: Joi.string()
        .trim()
        .max(60)
        .required(),
      otherwise: Joi.forbidden(),
    }),
    clientSecret: Joi.when('protocol', {
      is: OAUTH,
      then: Joi.string()
        .trim()
        .max(300)
        .required(),
      otherwise: Joi.forbidden(),
    }),
  },
};

const isUserAuthorized = async ({ request }, next) => {
  const hasPermission = Array.from(new Set([request.body.org, null])).some(
    (orgId) =>
      findUserPermissionIndex(request.session.user.permissions, {
        name: 'yeep.org.write',
        orgId,
      }) !== -1
  );

  if (!hasPermission) {
    throw new AuthorizationError(
      `User ${request.session.user.id} is not authorized to perform this action`
    );
  }

  await next();
};

async function handler(ctx) {
  const { request, response } = ctx;
  const identityProvider = await createIdentityProvider(ctx, request.body);

  response.status = 200; // OK
  response.body = {
    identityProvider,
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
