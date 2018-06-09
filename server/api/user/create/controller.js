import Joi from 'joi';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { createValidationMiddleware } from '../../../middleware/validation';
import createUser from './service';

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
    fullName: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .required(),
    picture: Joi.string()
      .uri({ scheme: ['http', 'https'] })
      .trim()
      .max(500)
      .optional(),
    emails: Joi.array()
      .items(
        Joi.object()
          .unknown(false)
          .keys({
            address: Joi.string()
              .trim()
              .email()
              .max(100)
              .required(),
            isVerified: Joi.boolean()
              .default(false)
              .required(),
            isPrimary: Joi.boolean()
              .default(false)
              .required(),
          })
          .required()
      )
      .min(1)
      .max(10)
      .unique((a, b) => a.address === b.address)
      .required(),
  },
});

async function handler({ request, response, db }) {
  const user = await createUser(db, request.body);

  response.status = 200; // OK
  response.body = {
    user,
  };
}

export default compose([packJSONRPC, validation, handler]);
