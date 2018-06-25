import Joi from 'joi';
// import Boom from 'boom';
import compose from 'koa-compose';
import { createValidationMiddleware } from '../../../middleware/validation';
import packJSONRPC from '../../../middleware/packJSONRPC';
import createSessionToken from './service';

const validation = createValidationMiddleware({
  body: {
    username: Joi.string()
      .lowercase()
      .trim()
      .min(2)
      .max(30)
      .required()
      .regex(/^[A-Za-z0-9_\-.]*$/, { name: 'username' }),
    password: Joi.string()
      .trim()
      .min(8)
      .max(50)
      .required(),
  },
});

async function handler({ request, response, db, jwt }) {
  const { token, expiresIn } = await createSessionToken(db, jwt, request.body);

  response.status = 200; // OK
  response.body = {
    token,
    expiresIn,
  };
}

export default compose([packJSONRPC, validation, handler]);
