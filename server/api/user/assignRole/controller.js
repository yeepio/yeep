import Joi from 'joi';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { createValidationMiddleware } from '../../../middleware/validation';
import {
  visitSession,
  isUserAuthenticated,
  visitUserPermissions,
  isUserAuthorized,
} from '../../../middleware/auth';
import createRoleAssignment from './service';

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
    roleId: Joi.string()
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
  const roleAssignment = await createRoleAssignment(db, request.body);

  response.status = 200; // OK
  response.body = {
    roleAssignment,
  };
}

export default compose([
  packJSONRPC,
  visitSession(),
  isUserAuthenticated(),
  createValidationMiddleware(validationSchema),
  visitUserPermissions(),
  isUserAuthorized({
    permissions: ['yeep.role.assignment.write'],
    org: (request) => request.body.orgId,
  }),
  handler,
]);
