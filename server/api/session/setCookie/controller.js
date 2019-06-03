import Joi from 'joi';
import isemail from 'isemail';
import compose from 'koa-compose';
import mapValues from 'lodash/mapValues';
import isFunction from 'lodash/isFunction';
import { validateRequest } from '../../../middleware/validation';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { setSessionCookie, defaultProjection } from './service';
import authFactorSchema from '../../../models/AuthFactor';
import { PASSWORD } from '../../../constants/authFactorTypes';

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
        .valid(
          authFactorSchema.obj.type.enum.filter((e) => {
            return e !== PASSWORD; // do not accept password again
          })
        )
        .required(),
      token: Joi.string()
        .min(6)
        .max(50)
        .required(),
    }).optional(),
  },
};

async function handler(ctx) {
  const { request, response, config } = ctx;
  const { user, password, projection, secondaryAuthFactor } = request.body;

  const props = { password, projection, secondaryAuthFactor };
  if (isemail.validate(user)) {
    props.emailAddress = user;
  } else {
    props.username = user;
  }

  const { cookie, body, eol } = await setSessionCookie(ctx, props);

  ctx.cookies.set('session', cookie, {
    domain: isFunction(config.cookie.domain) ? config.cookie.domain(request) : config.cookie.domain,
    path: isFunction(config.cookie.path) ? config.cookie.path(request) : config.cookie.path,
    httpOnly: isFunction(config.cookie.httpOnly)
      ? config.cookie.httpOnly(request)
      : config.cookie.httpOnly,
    secure: isFunction(config.cookie.secure) ? config.cookie.secure(request) : config.cookie.secure,
    expires: eol,
    overwrite: true,
  });

  response.status = 200; // OK
  response.body = body;
}

export default compose([packJSONRPC, validateRequest(validationSchema), handler]);
