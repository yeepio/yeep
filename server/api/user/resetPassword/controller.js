import Joi from 'joi';
// import Boom from 'boom';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import resetPassword from './service';

export const validationSchema = {
  body: {
    token: Joi.string()
      .trim()
      .min(6)
      .max(100)
      .required()
      .regex(/^[A-Za-z0-9-]*$/, { name: 'token' }),
    password: Joi.string()
      .trim()
      .min(8)
      .max(50)
      .required(),
  },
};

async function handler(ctx) {
  const { request, response } = ctx;
  const user = await resetPassword(ctx, request.body);

  response.status = 200; // OK
  response.body = {
    user,
  };
}

export default compose([packJSONRPC, validateRequest(validationSchema), handler]);
