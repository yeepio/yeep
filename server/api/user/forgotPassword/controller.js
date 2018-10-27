import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import isemail from 'isemail';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import initPasswordReset from './service';

const validationSchema = {
  body: {
    userKey: Joi.alternatives().try([
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
    tokenExpiresInSeconds: Joi.number()
      .integer()
      .min(0)
      .max(30 * 24 * 60 * 60) // i.e. 30 days
      .optional()
      .default(3 * 60 * 60), // i.e. 3 hours
  },
};

async function handler({ request, response, db, bus, settings }) {
  const isUsernameEnabled = await settings.get('isUsernameEnabled');
  const { userKey, tokenExpiresInSeconds } = request.body;

  // check if userKey is email formatted
  const isUserKeyEmail = isemail.validate(userKey);

  // ensure userKey is email formatted - OR - username is enabled
  if (!isUserKeyEmail && !isUsernameEnabled) {
    const boom = Boom.badRequest('Invalid request body');
    boom.output.payload.details = [
      {
        path: ['userKey'],
        type: 'string.email',
      },
    ];
    throw boom;
  }

  // initiate password reset process
  const isPasswordResetInitiated = await initPasswordReset(db, bus, {
    tokenExpiresInSeconds,
    ...(isUserKeyEmail
      ? {
          emailAddress: request.body.userKey,
        }
      : {
          username: request.body.userKey,
        }),
  });

  if (!isPasswordResetInitiated) {
    throw Boom.internal();
  }

  response.status = 200; // OK
}

export default compose([packJSONRPC, validateRequest(validationSchema), handler]);
