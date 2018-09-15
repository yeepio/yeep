import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  visitSession,
  isUserAuthenticated,
  visitUserPermissions,
  isUserAuthorized,
} from '../../../middleware/auth';
import updatePermission from './service';
import getPermissionInfo from '../info/service';

const validationSchema = {
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
};

const visitRequestedPermission = async ({ request, db }, next) => {
  const permission = await getPermissionInfo(db, request.body);

  // visit session with permission data
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

export default compose([
  packJSONRPC,
  visitSession(),
  isUserAuthenticated(),
  validateRequest(validationSchema),
  visitRequestedPermission,
  visitUserPermissions(),
  isUserAuthorized({
    permissions: ['yeep.permission.write'],
    org: (request) => request.session.permission.scope,
  }),
  handler,
]);
