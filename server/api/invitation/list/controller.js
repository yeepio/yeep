import Joi from 'joi';
import compose from 'koa-compose';
import last from 'lodash/last';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  decorateSession,
  isUserAuthenticated,
  decorateUserPermissions,
  findUserPermissionIndex,
} from '../../../middleware/auth';
import listPendingInvitations, { parseCursor, stringifyCursor } from './service';
import { AuthorizationError } from '../../../constants/errors';

export const validationSchema = {
  body: {
    org: Joi.string()
      .length(24)
      .hex()
      .optional(),
    user: Joi.string()
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

const isUserAuthorized = async ({ request }, next) => {
  const isUserRequestorIdentical = request.session.user.id === request.body.user;
  const orgSet = new Set([request.body.org || null, null]);
  const hasPermission = Array.from(orgSet).some(
    (orgId) =>
      findUserPermissionIndex(request.session.user.permissions, {
        name: 'yeep.invitation.read',
        orgId,
      }) !== -1
  );

  if (!isUserRequestorIdentical && !hasPermission) {
    throw new AuthorizationError(
      `User ${request.session.user.id} does not have sufficient permissions to access this resource`
    );
  }

  await next();
};

async function handler({ request, response, db }) {
  const { user, org, limit, cursor } = request.body;

  const invitations = await listPendingInvitations(db, {
    userId: user,
    orgId: org,
    limit,
    cursor: cursor ? parseCursor(cursor) : null,
  });

  response.status = 200; // OK
  response.body = {
    invitations,
    nextCursor: invitations.length < limit ? undefined : stringifyCursor(last(invitations)),
  };
}

export default compose([
  packJSONRPC,
  decorateSession(),
  isUserAuthenticated(),
  validateRequest(validationSchema),
  decorateUserPermissions(),
  isUserAuthorized,
  handler,
]);
