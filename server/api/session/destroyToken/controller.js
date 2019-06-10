import Joi from 'joi';
import compose from 'koa-compose';
import Boom from 'boom';
import { validateRequest } from '../../../middleware/validation';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { destroySessionToken } from './service';

export const validationSchema = {
  body: {
    token: Joi.string()
      .trim()
      .min(100)
      .max(10000)
      .required(),
  },
};

async function handler(ctx) {
  const { request, response } = ctx;

  const isSessionTokenDestroyed = await destroySessionToken(ctx, request.body);

  if (!isSessionTokenDestroyed) {
    throw Boom.internal();
  }

  response.status = 200; // OK
}

export default compose([packJSONRPC, validateRequest(validationSchema), handler]);
