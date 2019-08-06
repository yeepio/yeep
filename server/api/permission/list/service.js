import { ObjectId } from 'mongodb';
import escapeRegExp from 'lodash/escapeRegExp';

export const stringifyCursor = ({ id }) => {
  return Buffer.from(JSON.stringify(id)).toString('base64');
};

export const parseCursor = (cursorStr) => {
  const id = JSON.parse(Buffer.from(cursorStr, 'base64').toString('utf8'));
  return { id };
};

function getPermissions({ db }, $match, limit) {
  return db.model('Permission').aggregate([
    {
      $match,
    },
    {
      $lookup: {
        from: 'orgMemberships',
        let: { permissionId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$permissions.id', '$$permissionId'],
              },
            },
          },
          {
            $group: {
              _id: '$userId',
            },
          },
        ],
        as: 'users',
      },
    },
    {
      $lookup: {
        from: 'roles',
        let: { permissionId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ['$$permissionId', '$permissions'],
              },
            },
          },
          {
            $project: {
              _id: 1,
            },
          },
        ],
        as: 'roles',
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
    {
      $limit: limit,
    },
  ]);
}

function getPermissionCount({ db }, $match) {
  return db.model('Permission').countDocuments($match);
}

function formatPermissions(permissions){
  return permissions.map((permission) => ({
    id: permission._id.toHexString(),
    name: permission.name,
    description: permission.description,
    isSystemPermission: permission.isSystemPermission,
    usersCount: permission.users.length,
    rolesCount: permission.roles.length,
    createdAt: permission.createdAt,
    updatedAt: permission.updatedAt,
  }));
}

async function listPermissions(ctx, { q, limit, cursor, scopes, role, isSystemPermission }) {

  const matchExpressions = [];

  if (!scopes.includes(null)) {
    matchExpressions.push({
      scope: { $in: scopes.map((scope) => ObjectId(scope)) },
    });
  }

  if (q) {
    matchExpressions.push({
      name: {
        $regex: `^${escapeRegExp(q)}`,
        $options: 'i',
      },
    });
  }

  if (role) {
    matchExpressions.push({
      _id: { $in: role.permissions.map((permission) => ObjectId(permission)) },
    });
  }

  if (isSystemPermission) {
    matchExpressions.push({
      isSystemPermission: { $eq: isSystemPermission },
    });
  }

  // get role count promise
  const getPermissionCountPromise = getPermissionCount(
    ctx,
    matchExpressions.length ? { $and: matchExpressions } : {}
  );

  // we don't want the cursor to be taken into account when counting
  if (cursor) {
    matchExpressions.push({
      _id: { $gt: ObjectId(cursor.id) },
    });
  }

  // get roles promise
  const getPermissionsPromise = getPermissions(
    ctx,
    matchExpressions.length ? { $and: matchExpressions } : {},
    limit
  );

  // retrieve permissions
  const [ permissions, permissionCount ] = await Promise.all([
    getPermissionsPromise,
    getPermissionCountPromise,
  ]);

  return {
    permissions: formatPermissions(permissions),
    permissionCount,
  };
}

export default listPermissions;
