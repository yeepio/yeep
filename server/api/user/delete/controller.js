import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { createValidationMiddleware } from '../../../middleware/validation';
import createAuthnMiddleware from '../../../middleware/authn';
import createAuthzMiddleware from '../../../middleware/authz';
import deleteUser from './service';
import getUserInfo from '../info/service';

const authn = createAuthnMiddleware();
const authz = createAuthzMiddleware({
  permissions: ['yeep.user.write'],
  org: (request) => request.session.requestedUser.orgs,
});

const validation = createValidationMiddleware({
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
  },
});

const intermission = async ({ request, db }, next) => {
  const user = await getUserInfo(db, request.body);

  // augment request object with session data
  request.session = {
    ...request.session,
    requestedUser: user,
  };

  await next();
};

async function handler({ request, response, db }) {
  const isUserDeleted = await deleteUser(db, request.session.requestedUser);

  if (!isUserDeleted) {
    throw Boom.internal();
  }

  response.status = 200; // OK
}

export default compose([packJSONRPC, authn, validation, intermission, authz, handler]);
