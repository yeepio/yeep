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
import deactivateUser from './service';

const validationSchema = {
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
    deactivateAfterSeconds: Joi.number()
      .integer()
      .min(0)
      .max(7 * 365 * 24 * 60 * 60) // i.e. 7 years
      .optional()
      .default(0),
  },
};

async function handler({ request, response, db }) {
  const user = await deactivateUser(db, request.body);

  response.status = 200; // OK
  response.body = {
    user,
  };
}

export default compose([
  packJSONRPC,
  visitSession(),
  isUserAuthenticated(),
  validateRequest(validationSchema),
  visitUserPermissions(),
  isUserAuthorized({
    // in global org scope
    permissions: ['yeep.user.write'],
  }),
  handler,
]);