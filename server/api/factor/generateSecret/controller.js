import Joi from 'joi';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import { decorateSession, isUserAuthenticated } from '../../../middleware/auth';
import { generateSOTPSecret } from './service';

export const validationSchema = {
  body: {
    type: Joi.string()
      .valid('SOTP')
      .required(),
    // TODO: maybe add provider here?
  },
};

async function handler(ctx) {
  const { request, response } = ctx;
  const { user } = request.session;

  const secret = await generateSOTPSecret(ctx, { userId: user.id });

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
