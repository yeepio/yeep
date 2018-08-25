import Joi from 'joi';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { createValidationMiddleware } from '../../../middleware/validation';
import createAuthnMiddleware from '../../../middleware/authn';
import createAuthzMiddleware from '../../../middleware/authz';
import createRoleAssignment from './service';

const authn = createAuthnMiddleware();
const authz = createAuthzMiddleware({
  permissions: ['yeep.role.assignment.write'],
  org: (request) => request.body.orgId,
});

const validation = createValidationMiddleware({
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
});

async function handler({ request, response, db }) {
  const roleAssignment = await createRoleAssignment(db, request.body);

  response.status = 200; // OK
  response.body = {
    roleAssignment,
  };
}

export default compose([packJSONRPC, authn, validation, authz, handler]);
