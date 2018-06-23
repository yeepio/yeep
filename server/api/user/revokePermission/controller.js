import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { createValidationMiddleware } from '../../../middleware/validation';
import deletePermissionAssignment from './service';

const validation = createValidationMiddleware({
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
  },
});

async function handler({ request, response, db }) {
  const isPermissionAssignmentDeleted = await deletePermissionAssignment(
    db,
    request.body
  );

  if (!isPermissionAssignmentDeleted) {
    throw Boom.internal();
  }

  response.status = 200; // OK
}

export default compose([packJSONRPC, validation, handler]);
