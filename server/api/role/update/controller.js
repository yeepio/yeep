import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { createValidationMiddleware } from '../../../middleware/validation';
import createAuthnMiddleware from '../../../middleware/authn';
import createAuthzMiddleware from '../../../middleware/authz';
import updateRole from './service';
import getRoleInfo from '../info/service';

const authn = createAuthnMiddleware();
const authz = createAuthzMiddleware({
  permissions: ['yeep.role.write'],
  org: (request) => request.session.role.scope,
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
      .regex(/^[A-Za-z0-9_\-.:]*$/, { name: 'role' }),
    description: Joi.string()
      .trim()
      .max(140)
      .optional(),
    permissions: Joi.array()
      .items(
        Joi.string()
          .length(24)
          .hex()
      )
      .min(1)
      .max(100)
      .single()
      .unique()
      .optional(),
  },
});

const customMiddleware = async ({ request, db }, next) => {
  const role = await getRoleInfo(db, request.body);

  // augment request object with session data
  request.session = {
    ...request.session,
    role,
  };

  await next();
};

async function handler({ request, response, db }) {
  const { name, description, permissions } = request.body;

  // ensure name or description have been specified
  if (!(name || description || permissions)) {
    const boom = Boom.badRequest('Invalid request body');
    boom.output.payload.details = [
      {
        path: ['name'],
        type: 'any.required',
      },
    ];
    throw boom;
  }

  const role = await updateRole(db, request.session.role, {
    name,
    description,
    permissions,
  });

  response.status = 200; // OK
  response.body = {
    role,
  };
}

export default compose([packJSONRPC, authn, validation, customMiddleware, authz, handler]);
