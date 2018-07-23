import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { createValidationMiddleware } from '../../../middleware/validation';
import createAuthnMiddleware from '../../../middleware/authn';
import createAuthzMiddleware from '../../../middleware/authz';
import deleteOrg from './service';

const authn = createAuthnMiddleware();
const authz = createAuthzMiddleware({
  permissions: ['yeep.org.write'],
  org: (request) => request.body.id,
});

const validation = createValidationMiddleware({
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
  },
});

async function handler({ request, response, db }) {
  const isOrgDeleted = await deleteOrg(db, {
    ...request.body,
    adminId: request.session.user.id,
  });

  if (!isOrgDeleted) {
    throw Boom.internal();
  }

  response.status = 200; // OK
}

export default compose([packJSONRPC, authn, validation, authz, handler]);
