import Joi from 'joi';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import { decorateSession, isUserAuthenticated } from '../../../middleware/auth';
import { enrollSOTPFactor } from './service';

export const validationSchema = {
  body: {
    type: Joi.string()
      .valid('SOTP')
      .required(),
    key: Joi.string()
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

  const secret = await enrollSOTPFactor(ctx, request.body);

  response.status = 200; // OK
  response.body = {
    secret,
  };
}

export default compose([
  packJSONRPC,
  decorateSession(),
  validateRequest(validationSchema),
  isUserAuthenticated(),
  handler,
]);
