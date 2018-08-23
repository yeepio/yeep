import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { createValidationMiddleware } from '../../../middleware/validation';
import createAuthnMiddleware from '../../../middleware/authn';
import createAuthzMiddleware from '../../../middleware/authz';
import deleteRole from './service';
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
  const isRoleDeleted = await deleteRole(db, request.session.role);

  if (!isRoleDeleted) {
    throw Boom.internal();
  }

  response.status = 200; // OK
}

export default compose([packJSONRPC, authn, validation, customMiddleware, authz, handler]);
