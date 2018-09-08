import has from 'lodash/has';
import typeOf from 'typeof';
import flow from 'lodash/fp/flow';
import filter from 'lodash/fp/filter';
import castArray from 'lodash/fp/castArray';
import concat from 'lodash/fp/concat';
import binarySearch from 'binary-search';
import { AuthorizationError } from '../constants/errors';
import { getUserPermissions } from '../api/user/info/service';

const formatOrgIds = flow(castArray, filter(Boolean), concat(['']));

/**
 * Creates and returns authorization middleware with the specified options.
 * @param {Object} options
 * @property {Array<string>} options.permissions
 * @property {Function} [options.org] function to extract org ID from request, e.g. (request) => request.params.org
 * @returns {Function}
 */
function createAuthzMiddleware({ org: getOrg, permissions = [] }) {
  if (!Array.isArray(permissions)) {
    throw new TypeError(
      `Invalid "permissions" property; expected array, received ${typeOf(permissions)}`
    );
  }

  if (permissions.length === 0) {
    throw new TypeError('You must specify at least one permission to authorize against');
  }

  return async ({ request, db }, next) => {
    // ensure user is authenticated
    if (!has(request, ['session', 'user'])) {
      throw new AuthorizationError('Unable to authorize non-authenticated user');
    }

    // extract user id
    const userId = request.session.user.id;

    // extract org ids (if org function is specified)
    const orgIds = formatOrgIds(getOrg ? getOrg(request) : '');

    // retrieve user permissions
    const userPermissions = await getUserPermissions(db, { userId });

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

    // augment request session data
    request.session = {
      ...request.session,
      user: {
        ...request.session.user,
        permissions: userPermissions,
      },
    };

    await next();
  };
}

export default createAuthzMiddleware;
