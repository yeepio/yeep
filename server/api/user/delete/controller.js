import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import { createValidationMiddleware } from '../../../middleware/validation';

const validation = createValidationMiddleware({
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
  },
});

async function handler({ request, response, db }) {
  const UserModel = db.model('User');

  const result = await UserModel.deleteOne({ _id: request.body.id });

  if (!result.ok) throw Boom.internal();

  response.status = 204; // No Content
}

export default compose([validation, handler]);
