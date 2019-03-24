import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import { TokenNotFoundError, AuthorizationError } from '../../../constants/errors';
import { decorateSession } from '../../../middleware/auth';
import createUser from '../../user/create/service';
import getUserInfo from '../../user/info/service';
import addMemberToOrg from '../../org/addMember/service';

export const validationSchema = {
  body: {
    token: Joi.string()
      .trim()
      .min(6)
      .max(100)
      .required()
      .regex(/^[A-Za-z0-9-]*$/, { name: 'token' }),
    username: Joi.string()
      .lowercase()
      .trim()
      .min(2)
      .max(30)
      .optional()
      .regex(/^[A-Za-z0-9_\-.]*$/, { name: 'username' }),
    password: Joi.string()
      .trim()
      .min(8)
      .max(50)
      .optional(),
    fullName: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .optional(),
    picture: Joi.string()
      .uri({ scheme: ['http', 'https'] })
      .trim()
      .max(500)
      .optional(),
  },
};

const decorateToken = async ({ request, db }, next) => {
  const TokenModel = db.model('Token');

  // acquire token from db
  const tokenRecord = await TokenModel.findOne({
    secret: request.body.token,
    type: 'INVITATION',
  });

  // ensure token exists
  if (!tokenRecord) {
    throw new TokenNotFoundError('Token does not exist or has already expired');
  }

  // decorate session obj
  request.session = {
    ...request.session,
    invitationToken: tokenRecord,
  };

  await next();
};

const isUserAuthorized = async ({ request }, next) => {
  const { invitationToken, user } = request.session;

  if (invitationToken.user) {
    if (!user) {
      throw new AuthorizationError(
        `Invitation token "${
          invitationToken.secret
        }" is exclusive to an authenticated user; please login and retry`
      );
    }

    if (user.id !== invitationToken.user.toHexString()) {
      throw new AuthorizationError(
        `Invitation token "${invitationToken.secret}" cannot be redeemed by user "${user.username}"`
      );
    }
  }

  await next();
};

const isUserParamsRequired = async ({ request }, next) => {
  const { user } = request.session;

  if (user) {
    ['username', 'password', 'fullName', 'picture'].forEach((k) => {
      if (request.body[k]) {
        const boom = Boom.badRequest('Invalid request body');
        boom.output.payload.details = [
          {
            path: [k],
            type: 'any.forbidden',
          },
        ];
        throw boom;
      }
    });
  } else {
    ['username', 'password', 'fullName'].forEach((k) => {
      if (!request.body[k]) {
        const boom = Boom.badRequest('Invalid request body');
        boom.output.payload.details = [
          {
            path: [k],
            type: 'any.required',
          },
        ];
        throw boom;
      }
    });
  }

  await next();
};

async function handler({ request, response, db, bus }) {
  const { invitationToken } = request.session;
  const TokenModel = db.model('Token');

  const user = await (request.session.user
    ? getUserInfo(db, { id: request.session.user.id })
    : createUser(db, {
        username: request.body.username,
        password: request.body.password,
        fullName: request.body.fullName,
        emails: [
          {
            address: invitationToken.payload.get('emailAddress'),
            isVerified: true,
            isPrimary: true,
          },
        ],
      }));

  // create org membership
  await addMemberToOrg(db, {
    orgId: invitationToken.org.toHexString(),
    userId: user.id,
    permissions: invitationToken.payload.get('permissions'),
    roles: invitationToken.payload.get('roles'),
  });

  // redeem token, i.e. delete from db
  await TokenModel.deleteOne({ _id: invitationToken._id });

  // emit event
  bus.emit('join_user', {
    user,
    org: {
      id: invitationToken.org.toHexString(),
    },
  });

  response.status = 200; // OK
  response.body = {
    user: {
      ...user,
      orgs: [...user.orgs, invitationToken.payload.orgId],
    },
  };
}

export default compose([
  packJSONRPC,
  decorateSession(),
  validateRequest(validationSchema),
  decorateToken,
  isUserAuthorized,
  isUserParamsRequired,
  handler,
]);
