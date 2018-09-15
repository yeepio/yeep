import Joi from 'joi';
import compose from 'koa-compose';
import last from 'lodash/last';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  visitSession,
  isUserAuthenticated,
  visitUserPermissions,
  getAuthorizedUniqueOrgIds,
} from '../../../middleware/auth';
import listPermissions, { parseCursor, stringifyCursor } from './service';

const validation = validateRequest({
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

  const permissions = await listPermissions(db, {
    q,
    limit,
    cursor: cursor ? parseCursor(cursor) : null,
    scopes: getAuthorizedUniqueOrgIds(request),
  });

  response.status = 200; // OK
  response.body = {
    permissions,
    nextCursor: permissions.length < limit ? undefined : stringifyCursor(last(permissions)),
  };
}

export default compose([
  packJSONRPC,
  visitSession(),
  isUserAuthenticated(),
  validation,
  visitUserPermissions(),
  handler,
]);
