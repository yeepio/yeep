import { ObjectId } from 'mongodb';
import has from 'lodash/has';
import escapeRegExp from 'lodash/escapeRegExp';

export const stringifyCursor = ({ id }) => {
  return Buffer.from(JSON.stringify(id)).toString('base64');
};

export const parseCursor = (cursorStr) => {
  const id = JSON.parse(Buffer.from(cursorStr, 'base64').toString('utf8'));
  return { id };
};

function getRoles({ db }, $match, limit) {
  return db.model('Role').aggregate([
    {
      $match,
    },
    {
      $lookup: {
        from: 'orgMemberships',
        let: { roleId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$roles.id', '$$roleId'],
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
        from: 'orgs',
        localField: 'scope',
        foreignField: '_id',
        as: 'org',
      },
    },
    {
      $unwind: {
        path: '$org',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $limit: limit,
    },
  ]);
}

function getRoleCount({ db }, $match) {
  return db.model('Role').countDocuments($match);
}

function formatRoles(roles) {
  return roles.map((role) => ({
    id: role._id.toHexString(),
    name: role.name,
    org: has(role, ['org', '_id'])
      ? {
          id: role.org._id.toHexString(),
          name: role.org.name,
        }
      : null,
    description: role.description,
    isSystemRole: role.isSystemRole,
    permissions: role.permissions,
    usersCount: role.users.length,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  }));
}

async function listRoles(ctx, { q, limit, cursor, scopes, isSystemRole }) {
  // decorate match expressions
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

  if (isSystemRole) {
    matchExpressions.push({
      isSystemRole: { $eq: isSystemRole },
    });
  }

  // get role count promise
  const getRoleCountPromise = getRoleCount(
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
  const getRolesPromise = getRoles(
    ctx,
    matchExpressions.length ? { $and: matchExpressions } : {},
    limit
  );

  // resolve both promises
  const [roles, roleCount] = await Promise.all([getRolesPromise, getRoleCountPromise]);

  return {
    roles: formatRoles(roles),
    roleCount,
  };
}

export default listRoles;
