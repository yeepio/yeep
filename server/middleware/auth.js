import Boom from 'boom';
import typeOf from 'typeof';
import has from 'lodash/has';
import get from 'lodash/get';
import uniq from 'lodash/uniq';
import isString from 'lodash/isString';
import isUndefined from 'lodash/isUndefined';
import isNull from 'lodash/isNull';
import binarySearch from 'binary-search';
import {
  AuthorizationError,
  UserNotFoundError,
  UserDeactivatedError,
  AuthenticationError,
} from '../constants/errors';
import { getUserPermissions } from '../api/user/info/service';
import { verifyCookieJWT } from '../api/session/refreshCookie/service';
import {
  refreshSession,
  deriveProjection,
  verifyBearerJWT,
} from '../api/session/refreshToken/service';
import { signCookieJWT } from '../api/session/setCookie/service';
import { isFunction } from 'util';
import { ObjectId } from 'mongodb';
import { isBefore } from 'date-fns';

async function decorateSessionByCookie(ctx, { cookie }) {
  const { request, config, cookies } = ctx;
  const now = new Date();

  const payload = await verifyCookieJWT(ctx, { token: cookie });

  // decorate request with session data
  request.session = {
    protocol: 'cookie',
    token: {
      secret: payload.jti,
    },
    user: payload.user,
  };

  // ensure cookie JWT has not expired
  if (payload.exp * 1000 >= now.getTime()) {
    return; // exit
  }

  // from here on JWT has expired...

  // check if autorenew is turned on
  if (!config.session.cookie.isAutoRenewEnabled) {
    cookies.set('session', '', {
      expires: new Date(0),
      overwrite: true,
    });

    throw Boom.unauthorized('Session cookie has expired', 'Cookie', {
      realm: config.name,
    });
  }

  // attempt to refresh the cookie - will throw error if something goes wrong
  try {
    const session = await refreshSession(ctx, {
      secret: payload.jti,
      userId: payload.user.id,
      projection: deriveProjection(payload.user),
    });
    const token = await signCookieJWT(ctx, session);

    cookies.set('session', token, {
      domain: isFunction(config.session.cookie.domain)
        ? config.session.cookie.domain(request)
        : config.session.cookie.domain,
      path: isFunction(config.session.cookie.path)
        ? config.session.cookie.path(request)
        : config.session.cookie.path,
      httpOnly: isFunction(config.session.cookie.httpOnly)
        ? config.session.cookie.httpOnly(request)
        : config.session.cookie.httpOnly,
      secure: isFunction(config.session.cookie.secure)
        ? config.session.cookie.secure(request)
        : config.session.cookie.secure,
      expires: session.expiresAt,
      overwrite: true,
    });
  } catch (err) {
    cookies.set('session', '', {
      expires: new Date(0),
      overwrite: true,
    });

    throw err; // re-throw
  }
}

async function decorateSessionByToken(ctx, { authorizationHeader }) {
  const { config, request } = ctx;
  const now = new Date();

  // parse authorization header
  const [protocol, token] = authorizationHeader.split(' ');

  // ensure authorization protocol is "Bearer"
  if (protocol.toLowerCase() !== 'bearer') {
    throw Boom.unauthorized('Invalid authorization schema', 'Bearer', {
      realm: 'Yeep',
    });
  }

  // verify authorization JWT authenticity
  let tokenPayload = await verifyBearerJWT(ctx, { token });

  // ensure cookie JWT has not expired
  if (tokenPayload.exp * 1000 < now.getTime()) {
    throw Boom.unauthorized('Session cookie has expired', 'Cookie', {
      realm: config.name,
    });
  }

  // decorate request with session data
  request.session = {
    protocol: 'bearer',
    token: {
      secret: tokenPayload.jti,
    },
    user: tokenPayload.user,
  };
}

export function decorateSession() {
  return async (ctx, next) => {
    const cookie = ctx.cookies.get('session');
    const authorizationHeader = ctx.request.headers.authorization;

    if (cookie) {
      await decorateSessionByCookie(ctx, { cookie });
    } else if (authorizationHeader) {
      await decorateSessionByToken(ctx, { authorizationHeader });
    }

    await next();
  };
}

export async function isSessionCookie({ request, config }, next) {
  if (get(request, ['session', 'protocol']) !== 'cookie') {
    throw Boom.unauthorized('Session cookie not specified', 'Cookie', {
      realm: config.name,
    });
  }

  await next();
}

export const isUserAuthenticated = () => async ({ request }, next) => {
  if (!has(request, ['session', 'user'])) {
    throw new AuthenticationError('Access denied; invalid or missing credentials'); // lie with 404
  }

  await next();
};

export async function decorateSessionUserProfile(ctx, next) {
  const { request, db } = ctx;
  const UserModel = db.model('User');

  // ensure user is authenticated
  if (!has(request, ['session', 'user'])) {
    throw new AuthorizationError('Unable to authorize non-authenticated user');
  }

  // retrieve user profile
  const user = await UserModel.findOne({
    _id: ObjectId(request.session.user.id),
  });

  // make sure user exists
  if (!user) {
    throw new UserNotFoundError(`User ${request.session.user.id} not found`);
  }

  // make sure user is active
  if (!!user.deactivatedAt && isBefore(user.deactivatedAt, new Date())) {
    throw new UserDeactivatedError(`User ${request.session.user.id} is deactivated`);
  }

  // decorate request.session with user profile
  request.session = {
    ...request.session,
    user: {
      ...request.session.user,
      username: user.username,
      emails: user.emails,
      fullName: user.fullName,
      picture: user.picture,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };

  await next();
}

export const decorateUserPermissions = () => async (ctx, next) => {
  const { request } = ctx;
  // ensure user is authenticated
  if (!has(request, ['session', 'user'])) {
    throw new AuthorizationError('Unable to authorize non-authenticated user');
  }

  // extract user id
  const userId = request.session.user.id;

  // retrieve user permissions
  const userPermissions = await getUserPermissions(ctx, { userId });

  // decorate request with user permissions
  request.session = {
    ...request.session,
    user: {
      ...request.session.user,
      permissions: userPermissions,
    },
  };

  await next();
};

/**
 * Finds and returns the index of the user permission object that matches the specified properties.
 * @param {Array<Object>} userPermissions array of user permissions to inspect
 * @param {Object} props matching properties
 * @prop {string} props.name permission name
 * @prop {string} [props.orgId] permission orgId (optional)
 * @returns {Number}
 */
export const findUserPermissionIndex = (userPermissions, { name, orgId }) => {
  if (!isString(name)) {
    throw new TypeError(`Invalid name prop; expected string, received ${typeOf(name)}`);
  }

  if (!(isNull(orgId) || isUndefined(orgId) || isString(orgId))) {
    throw new TypeError(`Invalid orgId prop; expected string, received ${typeOf(orgId)}`);
  }

  const index = binarySearch(
    userPermissions,
    {
      name,
      orgId: orgId || '',
    },
    (a, b) => a.name.localeCompare(b.name) || a.orgId.localeCompare(b.orgId)
  );

  return Math.max(index, -1);
};

export const getAuthorizedUniqueOrgIds = (request, permission) => {
  const userPermissions = get(request, ['session', 'user', 'permissions']);
  const orgIds = userPermissions.filter((e) => e.name === permission).map((e) => e.orgId || null);
  return uniq(orgIds);
};
