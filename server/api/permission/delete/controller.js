import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { createValidationMiddleware } from '../../../middleware/validation';
import createAuthnMiddleware from '../../../middleware/authn';
import createAuthzMiddleware from '../../../middleware/authz';
import deletePermission from './service';
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
  const isPermissionDeleted = await deletePermission(db, request.session.permission);

  if (!isPermissionDeleted) {
    throw Boom.internal();
  }

  response.status = 200; // OK
}

export default compose([packJSONRPC, authn, validation, customMiddleware, authz, handler]);
