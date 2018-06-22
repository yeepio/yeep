import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { createValidationMiddleware } from '../../../middleware/validation';
import deletePermission from './service';

const validation = createValidationMiddleware({
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
  },
});

async function handler({ request, response, db }) {
  const isPermissionDeleted = await deletePermission(db, request.body);

  if (!isPermissionDeleted) {
    throw Boom.internal();
  }

  response.status = 200; // OK
}

export default compose([packJSONRPC, validation, handler]);
