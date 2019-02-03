import Joi from 'joi';
import isemail from 'isemail';
import compose from 'koa-compose';
import { validateRequest } from '../../../middleware/validation';
import packJSONRPC from '../../../middleware/packJSONRPC';
import createSessionToken from './service';

const validationSchema = {
  body: {
    user: Joi.alternatives().try([
      Joi.string()
        .lowercase()
        .trim()
        .min(2)
        .max(30)
        .required()
        .regex(/^[A-Za-z0-9_\-.]*$/, { name: 'username' }),
      Joi.string()
        .trim()
        .email()
        .max(100)
        .required(),
    ]),
    password: Joi.string()
      .trim()
      .min(8)
      .max(50)
      .required(),
    includePermissions: Joi.boolean()
      .optional()
      .default(false),
  },
};

async function handler({ request, response, db, jwt }) {
  const { user, password, includePermissions } = request.body;

  const { token, expiresIn } = await createSessionToken(db, jwt, {
    password,
    ...(isemail.validate(user)
      ? {
          emailAddress: request.body.user,
        }
      : {
          username: request.body.user,
        }),
    includePermissions,
  });

  response.status = 200; // OK
  response.body = {
    token,
    expiresIn,
  };
}

export default compose([packJSONRPC, validateRequest(validationSchema), handler]);
