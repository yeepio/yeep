import { ObjectId } from 'mongodb';
import has from 'lodash/has';
import get from 'lodash/get';
import escapeRegExp from 'lodash/escapeRegExp';

export const stringifyCursor = ({ id }) => {
  return Buffer.from(JSON.stringify(id)).toString('base64');
};

export const parseCursor = (cursorStr) => {
  const id = JSON.parse(Buffer.from(cursorStr, 'base64').toString('utf8'));
  return { id };
};

const getRoles = (model, db, $match, limit) => {
  return model.aggregate([
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
};

const getTotalCount = (model, db, $match) => {
  return model.aggregate([
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
      $count: 'totalCount',
    },
  ]);
};

async function listRoles({ db }, { q, limit, cursor, scopes, isSystemRole }) {
  const RoleModel = db.model('Role');

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

  if (cursor) {
    matchExpressions.push({
      _id: { $gt: ObjectId(cursor.id) },
    });
  }

  if (isSystemRole) {
    matchExpressions.push({
      isSystemRole: { $eq: isSystemRole },
    });
  }

  const $match = matchExpressions.length ? { $and: matchExpressions } : {};

  const [roles, totalCountAggregate] = await Promise.all([
    getRoles(RoleModel, db, $match, limit),
    getTotalCount(RoleModel, db, $match),
  ]);

  const totalCount = get(totalCountAggregate, '[0].totalCount');
  const sanitizedRoles = roles.map((role) => ({
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

  return {
    roles: sanitizedRoles,
    totalCount,
  };
}

export default listRoles;
