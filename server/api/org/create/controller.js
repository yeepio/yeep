import Joi from 'joi';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { createValidationMiddleware } from '../../../middleware/validation';
import createAuthnMiddleware from '../../../middleware/authn';
import createOrg from './service';

const authn = createAuthnMiddleware();

const validation = createValidationMiddleware({
  body: {
    name: Joi.string()
      .trim()
      .min(3)
      .max(100)
      .required(),
    slug: Joi.string()
      .lowercase()
      .trim()
      .min(3)
      .max(30)
      .required()
      .regex(/^[A-Za-z0-9\-_]*$/, { name: 'slug' }),
  },
});

async function handler({ request, response, db }) {
  const org = await createOrg(db, request.body);

  response.status = 200; // OK
  response.body = {
    org,
  };
}

export default compose([packJSONRPC, authn, validation, handler]);
