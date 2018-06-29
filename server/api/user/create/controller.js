import Joi from 'joi';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { createValidationMiddleware } from '../../../middleware/validation';
import createAuthnMiddleware from '../../../middleware/authn';
import createAuthzMiddleware from '../../../middleware/authz';
import createUser from './service';

const authn = createAuthnMiddleware();
const authz = createAuthzMiddleware({
  permissions: ['yeep.user.write'],
  org: (request) => {
    const { orgs } = request.body;
    return orgs.length === 1 ? orgs[0] : null;
  },
});

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
              .optional(),
            isPrimary: Joi.boolean()
              .default(false)
              .optional(),
          })
          .required()
      )
      .min(1)
      .max(10)
      .unique((a, b) => a.address === b.address)
      .required(),
    orgs: Joi.array()
      .items(
        Joi.string()
          .length(24)
          .hex()
      )
      .min(1)
      .max(10)
      .single()
      .unique()
      .default([])
      .optional(),
  },
});

async function handler({ request, response, db }) {
  const user = await createUser(db, request.body);

  response.status = 200; // OK
  response.body = {
    user,
  };
}

export default compose([packJSONRPC, authn, validation, authz, handler]);
