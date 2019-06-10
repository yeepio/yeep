import Joi from 'joi';
import compose from 'koa-compose';
import { validateRequest } from '../../../middleware/validation';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { refreshSessionToken } from './service';

export const validationSchema = {
  body: {
    token: Joi.string()
      .trim()
      .min(100)
      .max(10000)
      // .regex(/^[A-Za-z0-9\\.\\-]*$/, { name: 'accessToken' }),
      .required(),
  },
};

async function handler(ctx) {
  const { request, response } = ctx;

  const session = await refreshSessionToken(ctx, request.body);

  response.status = 200; // OK
  response.body = session;
}

export default compose([packJSONRPC, validateRequest(validationSchema), handler]);
