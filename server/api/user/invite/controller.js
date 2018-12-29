import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import isemail from 'isemail';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import inviteUser, {
  defaultTokenExpiresInSeconds,
  defaultRoles,
  defaultPermissions,
} from './service';
import {
  findUserPermissionIndex,
  visitUserPermissions,
  visitSession,
  isUserAuthenticated,
} from '../../../middleware/auth';
import { AuthorizationError } from '../../../constants/errors';

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
    orgId: Joi.string()
      .length(24)
      .hex()
      .required(),
    permissions: Joi.array()
      .items(
        Joi.string()
          .length(24)
          .hex()
      )
      .min(1)
      .max(100)
      .single()
      .unique()
      .optional()
      .default(defaultPermissions),
    roles: Joi.array()
      .items(
        Joi.string()
          .length(24)
          .hex()
      )
      .min(1)
      .max(100)
      .single()
      .unique()
      .optional()
      .default(defaultRoles),
    tokenExpiresInSeconds: Joi.number()
      .integer()
      .min(0)
      .max(30 * 24 * 60 * 60) // i.e. 30 days
      .optional()
      .default(defaultTokenExpiresInSeconds), // i.e. 1 week
  },
};

const visitUserKeyType = async ({ request }, next) => {
  const { userKey } = request.body;
  const isUserKeyEmail = isemail.validate(userKey);

  // visit session object
  request.session = {
    ...request.session,
    isUserKeyEmail,
  };

  await next();
};

const isUserKeyValid = async ({ request, settings }, next) => {
  const isUsernameEnabled = await settings.get('isUsernameEnabled');
  const { userKey } = request.body;

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

  await next();
};

const isUserAuthorized = async ({ request }, next) => {
  const hasPermission = [request.body.orgId, null].some(
    (orgId) =>
      findUserPermissionIndex(request.session.user.permissions, {
        name: 'yeep.user.write',
        orgId,
      }) !== -1
  );

  if (!hasPermission) {
    throw new AuthorizationError(
      `User "${
        request.session.user.username
      }" does not have sufficient permissions to access this resource`
    );
  }

  await next();
};

async function handler({ request, response, db, bus }) {
  const { tokenExpiresInSeconds, orgId, permissions, roles } = request.body;
  const { user, isUserKeyEmail } = request.session;
  const UserModel = db.model('User');

  // initiate password reset process
  const isUserInvited = await inviteUser(db, bus, {
    orgId,
    permissions,
    roles,
    tokenExpiresInSeconds,
    inviterId: user.id,
    inviterUsername: user.username,
    inviterFullName: user.fullName,
    inviterPicture: user.picture,
    inviterEmailAddress: UserModel.getPrimaryEmailAddress(user.emails),
    inviter: request.session.user,
    ...(isUserKeyEmail
      ? {
          emailAddress: request.body.userKey,
        }
      : {
          username: request.body.userKey,
        }),
  });

  if (!isUserInvited) {
    throw Boom.internal();
  }

  response.status = 200; // OK
}

export default compose([
  packJSONRPC,
  visitSession(),
  isUserAuthenticated(),
  validateRequest(validationSchema),
  visitUserKeyType,
  isUserKeyValid,
  visitUserPermissions(),
  isUserAuthorized,
  handler,
]);
