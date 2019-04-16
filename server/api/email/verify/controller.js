import Joi from 'joi';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import verify from './service';

export const validationSchema = {
  body: {
    token: Joi.string()
      .trim()
      .min(6)
      .max(100)
      .required()
      .regex(/^[A-Za-z0-9-]*$/, { name: 'token' }),
  },
};

async function handler(ctx) {
  const { request, response } = ctx;
  const user = await verify(ctx, request.body);

  response.status = 200; // OK
  response.body = {
    user,
  };
}

export default compose([packJSONRPC, validateRequest(validationSchema), handler]);
