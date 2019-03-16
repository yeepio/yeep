import Joi from 'joi';
import isemail from 'isemail';
import compose from 'koa-compose';
import mapValues from 'lodash/mapValues';
import { validateRequest } from '../../../middleware/validation';
import packJSONRPC from '../../../middleware/packJSONRPC';
import createSession, { defaultScope } from './service';

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
    scope: Joi.object(
      mapValues(defaultScope, (value) =>
        Joi.boolean()
          .optional()
          .default(value)
      )
    )
      .optional()
      .default(defaultScope),
  },
};

async function handler(ctx) {
  const { request, response } = ctx;
  const { user, password, scope } = request.body;

  const props = { password, scope };
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
