import Joi from 'joi';
import isemail from 'isemail';
import compose from 'koa-compose';
import mapValues from 'lodash/mapValues';
import isFunction from 'lodash/isFunction';
import { validateRequest } from '../../../middleware/validation';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { signCookieJWT } from './service';
import authFactorSchema from '../../../models/AuthFactor';
import { PASSWORD } from '../../../constants/authFactorTypes';
import { createSession, defaultProjection } from '../issueToken/service';

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

  const session = await createSession(ctx, props);
  const token = await signCookieJWT(ctx, session);

  ctx.cookies.set('session', token, {
    domain: isFunction(config.session.cookie.domain)
      ? config.session.cookie.domain(request)
      : config.session.cookie.domain,
    path: isFunction(config.session.cookie.path)
      ? config.session.cookie.path(request)
      : config.session.cookie.path,
    httpOnly: isFunction(config.session.cookie.httpOnly)
      ? config.session.cookie.httpOnly(request)
      : config.session.cookie.httpOnly,
    secure: isFunction(config.session.cookie.secure)
      ? config.session.cookie.secure(request)
      : config.session.cookie.secure,
    expires: session.expiresAt,
    overwrite: true,
  });

  response.status = 200; // OK
  response.body = session.payload;
}

export default compose([packJSONRPC, validateRequest(validationSchema), handler]);
