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
import createPermissionAssignment from './service';

const validationSchema = {
  body: {
    userId: Joi.string()
      .length(24)
      .hex()
      .required(),
    orgId: Joi.string()
      .length(24)
      .hex()
      .optional(),
    permissionId: Joi.string()
      .length(24)
      .hex()
      .required(),
    resourceId: Joi.alternatives().try(
      Joi.number(),
      Joi.string()
        .trim()
        .min(2)
        .max(140)
    ),
  },
};

async function handler({ request, response, db }) {
  const permissionAssignment = await createPermissionAssignment(db, request.body);

  response.status = 200; // OK
  response.body = {
    permissionAssignment,
  };
}

export default compose([
  packJSONRPC,
  visitSession(),
  isUserAuthenticated(),
  validateRequest(validationSchema),
  visitUserPermissions(),
  isUserAuthorized({
    permissions: ['yeep.permission.assignment.write'],
    org: (request) => request.body.orgId,
  }),
  handler,
]);
