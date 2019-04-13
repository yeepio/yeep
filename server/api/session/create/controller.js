import Joi from 'joi';
import isemail from 'isemail';
import compose from 'koa-compose';
import mapValues from 'lodash/mapValues';
import { validateRequest } from '../../../middleware/validation';
import packJSONRPC from '../../../middleware/packJSONRPC';
import createSession, { defaultProjection } from './service';
import authFactorSchema from '../../../models/AuthFactor';

export const validationSchema = {
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
    secondaryAuthFactor: Joi.object({
      type: Joi.string()
        // does not accept password again as secondary auth factor
        .valid(authFactorSchema.obj.type.enum.filter((e) => e !== 'PASSWORD'))
        .required(),
      token: Joi.string()
        .min(6)
        .max(50)
        .required(),
    }).optional(),
  },
};

async function handler(ctx) {
  const { request, response } = ctx;
  const { user, password, projection, secondaryAuthFactor } = request.body;

  const props = { password, projection, secondaryAuthFactor };
  if (isemail.validate(user)) {
    props.emailAddress = user;
  } else {
    props.username = user;
  }

  const session = await createSession(ctx, props);

  response.status = 200; // OK
  response.body = session;
}

export default compose([packJSONRPC, validateRequest(validationSchema), handler]);
