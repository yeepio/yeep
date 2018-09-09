import Joi from 'joi';
import compose from 'koa-compose';
import last from 'lodash/last';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { createValidationMiddleware } from '../../../middleware/validation';
import createAuthnMiddleware from '../../../middleware/authn';
import listRoles, { parseCursor, stringifyCursor } from './service';

const authn = createAuthnMiddleware();

const validation = createValidationMiddleware({
  body: {
    q: Joi.string()
      .trim()
      .max(2000)
      .optional(),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(500)
      .default(100)
      .optional(),
    cursor: Joi.string()
      .base64()
      .optional(),
  },
});

async function handler({ request, response, db }) {
  const { q, limit, cursor } = request.body;

  const roles = await listRoles(db, {
    q,
    limit,
    cursor: cursor ? parseCursor(cursor) : null,
    userId: request.session.user.id,
  });

  response.status = 200; // OK
  response.body = {
    roles,
    nextCursor: roles.length < limit ? undefined : stringifyCursor(last(roles)),
  };
}

export default compose([packJSONRPC, authn, validation, handler]);
