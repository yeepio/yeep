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
import listRoles, { parseCursor, stringifyCursor } from './service';

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
    scope: Joi.string()
      .base64()
      .optional(),
    isSystemRole: Joi.boolean()
      .optional(),
  },
};

async function handler({ request, response, db }) {
  const { q, limit, cursor, isSystemRole, scope } = request.body;

  // double check that the user requesting the scope has access to it
  let scopes = getAuthorizedUniqueOrgIds(request, 'yeep.role.read');
  if (scope) {
    scopes = scopes.filter((s) => s === scope);
  }

  const roles = await listRoles(db, {
    q,
    limit,
    cursor: cursor ? parseCursor(cursor) : null,
    scopes,
    isSystemRole,
  });

  response.status = 200; // OK
  response.body = {
    roles,
    nextCursor: roles.length < limit ? undefined : stringifyCursor(last(roles)),
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
