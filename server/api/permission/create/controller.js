import Joi from 'joi';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { createValidationMiddleware } from '../../../middleware/validation';
import createAuthnMiddleware from '../../../middleware/authn';
import createAuthzMiddleware from '../../../middleware/authz';
import createPermission from './service';

const authn = createAuthnMiddleware();
const authz = createAuthzMiddleware({
  permissions: ['yeep.permission.write'],
  org: (request) => request.body.scope,
});

const validation = createValidationMiddleware({
  body: {
    name: Joi.string()
      .lowercase()
      .trim()
      .min(2)
      .max(64)
      .required()
      .regex(/^[A-Za-z0-9_\-.]*$/, { name: 'permission' }),
    description: Joi.string()
      .trim()
      .max(140)
      .optional(),
    scope: Joi.string()
      .length(24)
      .hex()
      .optional(),
  },
});

async function handler({ request, response, db }) {
  const permission = await createPermission(db, request.body);

  response.status = 200; // OK
  response.body = {
    permission,
  };
}

export default compose([packJSONRPC, authn, validation, authz, handler]);
