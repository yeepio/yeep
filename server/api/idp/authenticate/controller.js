import Joi from 'joi';
import compose from 'koa-compose';
import { validateRequest } from '../../../middleware/validation';
import packJSONRPC from '../../../middleware/packJSONRPC';
import idps from '../../../idps';
import constructOAuthConsentURL from './service';

export const validationSchema = {
  body: {
    provider: Joi.string()
      .valid(Object.keys(idps))
      .required(),
    redirectUri: Joi.string()
      .uri({ scheme: ['http', 'https'] })
      .trim()
      .max(500)
      .required(),
  },
};

async function handler(ctx) {
  const { request, response } = ctx;

  const url = await constructOAuthConsentURL(ctx, request.body);

  response.status = 200; // OK
  response.body = { url };
}

export default compose([packJSONRPC, validateRequest(validationSchema), handler]);
