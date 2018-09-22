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
import listUsers, { parseCursor, stringifyCursor } from './service';

const validationSchema = {
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
};

async function handler({ request, response, db }) {
  const { q, limit, cursor } = request.body;

  const users = await listUsers(db, {
    q,
    limit,
    cursor: cursor ? parseCursor(cursor) : null,
    scopes: getAuthorizedUniqueOrgIds(request, 'yeep.user.read'),
  });

  response.status = 200; // OK
  response.body = {
    users,
    nextCursor: users.length < limit ? undefined : stringifyCursor(last(users)),
  };
}

export default compose([
  packJSONRPC,
  visitSession(),
  isUserAuthenticated(),
  validateRequest(validationSchema),
  visitUserPermissions(),
  handler,
]);
