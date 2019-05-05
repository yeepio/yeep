import Joi from 'joi';
import compose from 'koa-compose';
import { validateRequest } from '../../../middleware/validation';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { getIdentityProviderTypes } from './service';

export const validationSchema = {
  body: {
    q: Joi.string()
      .trim()
      .max(60)
      .optional(),
  },
};

async function handler(ctx) {
  const { request, response } = ctx;

  const types = await getIdentityProviderTypes(ctx, request.body);

  response.status = 200; // OK
  response.body = { types };
}

export default compose([packJSONRPC, validateRequest(validationSchema), handler]);
