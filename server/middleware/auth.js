import Boom from 'boom';
import typeOf from 'typeof';
import has from 'lodash/has';
import flow from 'lodash/fp/flow';
import filter from 'lodash/fp/filter';
import castArray from 'lodash/fp/castArray';
import concat from 'lodash/fp/concat';
import get from 'lodash/fp/get';
import map from 'lodash/fp/map';
import uniq from 'lodash/fp/uniq';
import binarySearch from 'binary-search';
import { AuthorizationError } from '../constants/errors';
import { getUserPermissions } from '../api/user/info/service';

const parseAuthorizationPayload = async ({ request, jwt }) => {
  const [schema, token] = request.headers.authorization.split(' ');

  if (schema !== 'Bearer') {
    throw Boom.unauthorized('Invalid authorization schema', 'Bearer', {
      realm: 'Yeep',
    });
  }

  try {
    const payload = await jwt.verify(token);
    return {
      tokenSecret: payload.jti,
      userId: payload.userId,
      issuedAt: new Date(payload.iat * 1000),
      expiresAt: new Date(payload.exp * 1000),
    };
  } catch (err) {
    throw Boom.unauthorized('Invalid authorization token', 'Bearer', {
      realm: 'Yeep',
    });
  }
};

export const visitSession = () => async ({ request, jwt, db }, next) => {
  // check if authentication header exists
  if (!request.headers.authorization) {
    await next();
    return; // exit
  }

  // parse authorization payload
  const { tokenSecret, userId, issuedAt, expiresAt } = await parseAuthorizationPayload({
    request,
    jwt,
  });

  // retrieve user info
  const TokenModel = db.model('Token');
  const records = await TokenModel.aggregate([
    { $match: { secret: tokenSecret } },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $project: {
        'user._id': 1,
        'user.username': 1,
        'user.emails': 1,
        'user.fullName': 1,
        'user.picture': 1,
        // 'user.orgs': 1,
        // 'user.roles': 1,
        'user.createdAt': 1,
        'user.updatedAt': 1,
      },
    },
    {
      $unwind: '$user',
    },
  ]).exec();

  // make sure authorization token is active
  if (records.length === 0 || !records[0].user._id.equals(userId)) {
    await next();
    return; // exit
  }

  // visit request with session data
  request.session = {
    token: {
      id: records[0]._id.toHexString(),
      issuedAt,
      expiresAt,
    },
    user: {
      ...records[0].user,
      id: records[0].user._id.toHexString(),
    },
  };

  await next();
};

export const isUserAuthenticated = () => async ({ request }, next) => {
  if (!has(request, ['session', 'user'])) {
    throw Boom.notFound('Resource does not exist'); // lie with 404
  }

  await next();
};

export const visitUserPermissions = () => async ({ request, db }, next) => {
  // ensure user is authenticated
  if (!has(request, ['session', 'user'])) {
    throw new AuthorizationError('Unable to authorize non-authenticated user');
  }

  // extract user id
  const userId = request.session.user.id;

  // retrieve user permissions
  const userPermissions = await getUserPermissions(db, { userId });

  // visit request with user permissions
  request.session = {
    ...request.session,
    user: {
      ...request.session.user,
      permissions: userPermissions,
    },
  };

  await next();
};

const formatOrgIds = flow(castArray, filter(Boolean), concat(['']));

export const isUserAuthorized = ({ org: getOrg, permissions = [] }) => {
  if (!Array.isArray(permissions)) {
    throw new TypeError(
      `Invalid "permissions" property; expected array, received ${typeOf(permissions)}`
    );
  }

  if (permissions.length === 0) {
    throw new TypeError('You must specify at least one permission to authorize against');
  }

  return async ({ request }, next) => {
    // extract org ids (if org function is specified)
    const orgIds = formatOrgIds(getOrg ? getOrg(request) : '');

    // extract user permissions
    const userPermissions = request.session.user.permissions;

    // check if permission requirements are met
    permissions.forEach((permission) => {
      const isPermissionRequirementOk = orgIds.some((orgId) => {
        const index = binarySearch(
          userPermissions,
          {
            name: permission,
            orgId,
          },
          (a, b) => a.name.localeCompare(b.name) || a.orgId.localeCompare(b.orgId)
        );

        return index >= 0;
      });

      if (!isPermissionRequirementOk) {
        throw new AuthorizationError(
          `User "${
            request.session.user.username
          }" does not have permission "${permission}" to access this resource`
        );
      }
    });

    await next();
  };
};

export const getAuthorizedUniqueOrgIds = flow(
  get(['session', 'user', 'permissions']),
  filter((permission) => permission.name === 'yeep.role.read'),
  map((permission) => permission.orgId || null),
  uniq
);