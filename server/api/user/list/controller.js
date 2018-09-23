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
import listUsers, { parseCursor, stringifyCursor, defaultProjection } from './service';

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
    projection: Joi.object({
      id: Joi.boolean()
        .optional()
        .default(defaultProjection.id),
      username: Joi.boolean()
        .optional()
        .default(defaultProjection.username),
      fullName: Joi.boolean()
        .optional()
        .default(defaultProjection.fullName),
      picture: Joi.boolean()
        .optional()
        .default(defaultProjection.picture),
      emails: Joi.boolean()
        .optional()
        .default(defaultProjection.emails),
      orgs: Joi.boolean()
        .optional()
        .default(defaultProjection.orgs),
      createdAt: Joi.boolean()
        .optional()
        .default(defaultProjection.createdAt),
      updatedAt: Joi.boolean()
        .optional()
        .default(defaultProjection.updatedAt),
    })
      .optional()
      .default(defaultProjection),
  },
};

async function handler({ request, response, db }) {
  const { q, limit, cursor, projection } = request.body;

  const users = await listUsers(db, {
    q,
    limit,
    cursor: cursor ? parseCursor(cursor) : null,
    scopes: getAuthorizedUniqueOrgIds(request, 'yeep.user.read'),
    projection,
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
