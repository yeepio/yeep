import Joi from 'joi';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  visitSession,
  isUserAuthenticated,
  visitUserPermissions,
  isUserAuthorized,
} from '../../../middleware/auth';
import createPermission from './service';

const validationSchema = {
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
};

async function handler({ request, response, db }) {
  const permission = await createPermission(db, request.body);

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
  visitUserPermissions(),
  isUserAuthorized({
    permissions: ['yeep.permission.write'],
    org: (request) => request.body.scope,
  }),
  handler,
]);
