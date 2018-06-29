// import Boom from 'boom';
// import isFunction from 'lodash/isFunction';
// import isString from 'lodash/isString';
import has from 'lodash/has';
import typeOf from 'typeof';
import { ObjectId } from 'mongodb';
import { AuthorizationError } from '../constants/errors';

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

    // extract org id (if specified)
    const orgId = getOrg ? getOrg(request) : null;

    // retrieve user permissions
    const PermissionAssignmentModel = db.model('PermissionAssignment');
    const records = await PermissionAssignmentModel.aggregate([
      {
        $match: {
          $and: [
            { user: ObjectId(userId) },
            orgId
              ? { $or: [{ org: ObjectId(orgId) }, { org: { $exists: false } }] }
              : { org: { $exists: false } },
          ],
        },
      },
      {
        $lookup: {
          from: 'permissions',
          localField: 'permission',
          foreignField: '_id',
          as: 'permission',
        },
      },
      // {
      //   $project: {
      //     _id: 0,
      //     permission: 1,
      //   },
      // },
      {
        $unwind: '$permission',
      },
      {
        $group: {
          _id: '$permission._id',
          permission: { $first: '$permission' },
        },
      },
      {
        $project: {
          _id: 0,
          id: '$permission._id',
          name: '$permission.name',
          description: '$permission.description',
          isSystemPermission: '$permission.isSystemPermission',
          scope: '$permission.scope',
        },
      },
    ]).exec();

    // console.log(JSON.stringify(records, null, 2));

    // check if permission requirements are met
    const set = new Set(records.map((record) => record.name));
    permissions.forEach((permission) => {
      if (!set.has(permission)) {
        throw new AuthorizationError(
          `User "${
            request.session.user.username
          }" does not have permission "${permission}" to access this resource`
        );
      }
    });

    await next();
  };
}

export default createAuthzMiddleware;
