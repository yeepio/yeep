import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { createValidationMiddleware } from '../../../middleware/validation';
import createAuthnMiddleware from '../../../middleware/authn';
import createAuthzMiddleware from '../../../middleware/authz';
import updatePermission from './service';
import getPermissionInfo from '../info/service';

const authn = createAuthnMiddleware();
const authz = createAuthzMiddleware({
  permissions: ['yeep.permission.write'],
  org: (request) => request.session.permission.scope,
});

const validation = createValidationMiddleware({
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
    name: Joi.string()
      .lowercase()
      .trim()
      .min(2)
      .max(64)
      .optional()
      .regex(/^[A-Za-z0-9_\-.]*$/, { name: 'permission' }),
    description: Joi.string()
      .trim()
      .max(140)
      .optional(),
  },
});

const customMiddleware = async ({ request, db }, next) => {
  const permission = await getPermissionInfo(db, request.body);

  // augment request object with session data
  request.session = {
    ...request.session,
    permission,
  };

  await next();
};

async function handler({ request, response, db }) {
  const { name, description } = request.body;

  // ensure name or description have been specified
  if (!(name || description)) {
    const boom = Boom.badRequest('Invalid request body');
    boom.output.payload.details = [
      {
        path: ['name'],
        type: 'any.required',
      },
    ];
    throw boom;
  }

  const permission = await updatePermission(db, request.session.permission, {
    name,
    description,
  });

  response.status = 200; // OK
  response.body = {
    permission,
  };
}

export default compose([packJSONRPC, authn, validation, customMiddleware, authz, handler]);
