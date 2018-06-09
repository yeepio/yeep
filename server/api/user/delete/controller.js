import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { createValidationMiddleware } from '../../../middleware/validation';
import deleteUser from './service';

const validation = createValidationMiddleware({
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
  },
});

async function handler({ request, response, db }) {
  const isUserDeleted = await deleteUser(db, request.body);

  if (!isUserDeleted) {
    throw Boom.internal();
  }

  response.status = 200; // OK
}

export default compose([packJSONRPC, validation, handler]);
