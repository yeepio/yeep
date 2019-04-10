import Joi from 'joi';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import { decorateSession, isUserAuthenticated } from '../../../middleware/auth';
import { createTOTPAuthFactor } from './service';

export const validationSchema = {
  body: {
    secret: Joi.string()
      .length(32)
      .required(),
    token: Joi.string()
      .length(6)
      .regex(/\d/)
      .required(),
  },
};

async function handler(ctx) {
  const { request, response } = ctx;
  const { user } = request.session;

  await createTOTPAuthFactor(ctx, {
    ...request.body,
    userId: user.id,
  });

  response.status = 200; // OK
}

export default compose([
  packJSONRPC,
  decorateSession(),
  validateRequest(validationSchema),
  isUserAuthenticated(),
  handler,
]);
