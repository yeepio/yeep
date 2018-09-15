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
import createRole from './service';

const validationSchema = {
  body: {
    name: Joi.string()
      .lowercase()
      .trim()
      .min(2)
      .max(64)
      .required()
      .regex(/^[A-Za-z0-9_\-.:]*$/, { name: 'role' }),
    description: Joi.string()
      .trim()
      .max(140)
      .optional(),
    permissions: Joi.array()
      .items(
        Joi.string()
          .length(24)
          .hex()
      )
      .min(1)
      .max(100)
      .single()
      .unique()
      .required(),
    scope: Joi.string()
      .length(24)
      .hex()
      .optional(),
  },
};

async function handler({ request, response, db }) {
  const role = await createRole(db, request.body);

  response.status = 200; // OK
  response.body = {
    role,
  };
}

export default compose([
  packJSONRPC,
  visitSession(),
  isUserAuthenticated(),
  createValidationMiddleware(validationSchema),
  visitUserPermissions(),
  isUserAuthorized({
    permissions: ['yeep.role.write'],
    org: (request) => request.body.scope,
  }),
  handler,
]);
