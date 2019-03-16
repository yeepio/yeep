import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  visitSession,
  isUserAuthenticated,
  visitUserPermissions,
  findUserPermissionIndex,
} from '../../../middleware/auth';
import deleteUser from './service';
import getUserInfo from '../info/service';
import { AuthorizationError } from '../../../constants/errors';

export const validationSchema = {
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
  },
};

const visitRequestedUser = async ({ request, db }, next) => {
  const user = await getUserInfo(db, request.body);

  // visit session object with requested user data
  request.session = {
    ...request.session,
    requestedUser: user,
  };

  await next();
};

const isUserAuthorized = async ({ request }, next) => {
  const isUserRequestorIdentical = request.session.user.id === request.body.id;
  const hasPermission = request.session.requestedUser.orgs
    .concat(null)
    .reduce((accumulator, orgId) => {
      return (
        accumulator ||
        findUserPermissionIndex(request.session.user.permissions, {
          name: 'yeep.user.write',
          orgId,
        }) !== -1
      );
    }, false);

  if (!isUserRequestorIdentical && !hasPermission) {
    throw new AuthorizationError(
      `User "${
        request.session.user.username
      }" does not have sufficient permissions to access this resource`
    );
  }

  await next();
};

async function handler({ request, response, db }) {
  const isUserDeleted = await deleteUser(db, request.session.requestedUser);

  if (!isUserDeleted) {
    throw Boom.internal();
  }

  response.status = 200; // OK
}

export default compose([
  packJSONRPC,
  visitSession(),
  isUserAuthenticated(),
  validateRequest(validationSchema),
  visitRequestedUser,
  visitUserPermissions(),
  isUserAuthorized,
  handler,
]);
