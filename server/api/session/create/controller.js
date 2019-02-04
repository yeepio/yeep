import Joi from 'joi';
import isemail from 'isemail';
import compose from 'koa-compose';
import mapValues from 'lodash/mapValues';
import { validateRequest } from '../../../middleware/validation';
import packJSONRPC from '../../../middleware/packJSONRPC';
import createSessionToken, { defaultProjection } from './service';

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
    projection: Joi.object(
      mapValues(defaultProjection, (value) =>
        Joi.boolean()
          .optional()
          .default(value)
      )
    )
      .optional()
      .default(defaultProjection),
  },
};

async function handler(ctx) {
  const { request, response } = ctx;
  const { user, password, projection } = request.body;

  const { token, expiresIn } = await createSessionToken(ctx, {
    password,
    ...(isemail.validate(user)
      ? {
          emailAddress: request.body.user,
        }
      : {
          username: request.body.user,
        }),
    projection,
  });

  response.status = 200; // OK
  response.body = {
    token,
    expiresIn,
  };
}

export default compose([packJSONRPC, validateRequest(validationSchema), handler]);
