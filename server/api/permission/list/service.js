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
      $sort: {
        _id: 1,
      },
    },
    {
      $limit: limit,
    },
    {
      $lookup: {
        from: 'roles',
        let: { e: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ['$$e', '$permissions'],
              },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
            },
          },
        ],
        as: 'roles',
      },
    },
    {
      $lookup: {
        from: 'orgs',
        let: { e: '$scope' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$e'],
              },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
            },
          },
        ],
        as: 'orgs',
      },
    },
  ]);
}

function getPermissionCount({ db }, $match) {
  return db.model('Permission').countDocuments($match);
}

function formatPermission(permission) {
  return {
    id: permission._id.toHexString(),
    name: permission.name,
    description: permission.description,
    isSystemPermission: permission.isSystemPermission,
    org:
      permission.orgs.length === 0
        ? null
        : {
            id: permission.orgs[0]._id.toHexString(),
            name: permission.orgs[0].name,
          },
    roles: permission.roles.map((role) => {
      return {
        id: role._id.toHexString(),
        name: role.name,
      };
    }),
    createdAt: permission.createdAt,
    updatedAt: permission.updatedAt,
  };
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

  if (isSystemPermission != null) {
    matchExpressions.push({
      isSystemPermission: { $eq: isSystemPermission },
    });
  }

  // get role count promise
  const permissionCountPromise = getPermissionCount(
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
  const permissionsPromise = getPermissions(
    ctx,
    matchExpressions.length ? { $and: matchExpressions } : {},
    limit
  );

  // retrieve permissions
  const [permissions, permissionCount] = await Promise.all([
    permissionsPromise,
    permissionCountPromise,
  ]);

  return {
    permissions: permissions.map(formatPermission),
    permissionCount,
  };
}

export default listPermissions;
