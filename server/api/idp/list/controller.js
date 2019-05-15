import Joi from 'joi';
import compose from 'koa-compose';
import last from 'lodash/last';
import { validateRequest } from '../../../middleware/validation';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { getIdentityProviders } from './service';

export const validationSchema = {
  body: {
    org: Joi.string()
      .length(24)
      .hex()
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
};

function stringifyCursor({ id }) {
  return Buffer.from(JSON.stringify(id)).toString('base64');
}

function parseCursor(cursorStr) {
  const id = JSON.parse(Buffer.from(cursorStr, 'base64').toString('utf8'));
  return { id };
}

async function handler(ctx) {
  const { request, response } = ctx;
  const { cursor, limit } = request.body;

  const identityProviders = await getIdentityProviders(ctx, {
    ...request.body,
    cursor: cursor ? parseCursor(cursor) : null,
  });

  response.status = 200; // OK
  response.body = {
    identityProviders,
    nextCursor:
      identityProviders.length < limit ? undefined : stringifyCursor(last(identityProviders)),
  };
}

export default compose([packJSONRPC, validateRequest(validationSchema), handler]);
