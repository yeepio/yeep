import Joi from 'joi';
import compose from 'koa-compose';
import Boom from 'boom';
import { validateRequest } from '../../../middleware/validation';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { destroySession } from './service';
import { verifyBearerJWT } from '../refreshToken/service';
import { InvalidAccessToken } from '../../../constants/errors';

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

  const payload = await verifyBearerJWT(ctx, request.body);

  // ensure JWT has not expired
  const now = new Date();
  if (payload.exp * 1000 < now.getTime()) {
    throw InvalidAccessToken('Authorization token has already expired');
  }

  const isSessionTokenDestroyed = await destroySession(ctx, {
    secret: payload.jti,
  });

  if (!isSessionTokenDestroyed) {
    throw Boom.internal();
  }

  response.status = 200; // OK
}

export default compose([packJSONRPC, validateRequest(validationSchema), handler]);
