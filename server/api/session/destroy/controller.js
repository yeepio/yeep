import Joi from 'joi';
import compose from 'koa-compose';
import Boom from 'boom';
import { validateRequest } from '../../../middleware/validation';
import packJSONRPC from '../../../middleware/packJSONRPC';
import destroySessionToken from './service';

const validationSchema = {
  body: {
    accessToken: Joi.string()
      .trim()
      .min(100)
      .max(10000)
      .required(),
    refreshToken: Joi.string()
      .trim()
      .min(6)
      .max(100)
      .regex(/^[A-Za-z0-9]*$/, { name: 'refreshToken' })
      .optional(),
  },
};

async function handler(ctx) {
  const { request, response } = ctx;

  const isSessionDestroyed = await destroySessionToken(ctx, request.body);

  if (!isSessionDestroyed) {
    throw Boom.internal();
  }

  response.status = 200; // OK
}

export default compose([packJSONRPC, validateRequest(validationSchema), handler]);
