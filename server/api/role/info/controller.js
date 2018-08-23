import Joi from 'joi';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { createValidationMiddleware } from '../../../middleware/validation';
import createAuthnMiddleware from '../../../middleware/authn';
import createAuthzMiddleware from '../../../middleware/authz';
import getRoleInfo from './service';

const authn = createAuthnMiddleware();
const authz = createAuthzMiddleware({
  permissions: ['yeep.role.read'],
  org: (request) => request.session.role.scope,
});

const validation = createValidationMiddleware({
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
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

async function handler({ request, response }) {
  response.status = 200; // OK
  response.body = {
    role: request.session.role,
  };
}

export default compose([packJSONRPC, authn, validation, customMiddleware, authz, handler]);
