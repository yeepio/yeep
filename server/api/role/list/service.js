import { ObjectId } from 'mongodb';
import escapeRegExp from 'lodash/escapeRegExp';

export const stringifyCursor = ({ id }) => {
  return Buffer.from(JSON.stringify(id)).toString('base64');
};

export const parseCursor = (cursorStr) => {
  const id = JSON.parse(Buffer.from(cursorStr, 'base64').toString('utf8'));
  return { id };
};

/**
 * Retrieves roles from db matching the supplied props.
 * @param {Object} ctx - context
 * @property {MongooseConnection} ctx.db
 * @param {Object} props
 * @property {string} [props.q] - search query
 * @property {number} [props.limit=100] - max number of roles to return
 * @property {Object} [props.cursor] - pagination cursor
 * @property {[string]} props.orgScope - array of org IDs to scope roles
 * @property {boolean} [props.isSystemRole] - indicates whether to return system roles
 * @return {Promise<Object>}
 */
export async function getRoles({ db }, { q, limit = 100, cursor, orgScope, isSystemRole }) {
  const RoleModel = db.model('Role');

  const matchExpressions = [];

  if (!orgScope.includes(null)) {
    matchExpressions.push({
      scope: { $in: orgScope.map((scope) => ObjectId(scope)) },
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

  if (isSystemRole != null) {
    matchExpressions.push({
      isSystemRole: { $eq: isSystemRole },
    });
  }

  // handle pagination
  if (cursor) {
    matchExpressions.push({
      _id: { $gt: ObjectId(cursor.id) },
    });
  }

  const pipeline = [
    {
      $match: matchExpressions.length !== 0 ? { $and: matchExpressions } : {},
    },
    {
      $sort: { _id: 1 },
    },
    {
      $limit: limit,
    },
    {
      $lookup: {
        from: 'orgs',
        localField: 'scope',
        foreignField: '_id',
        as: 'orgs',
      },
    },
    {
      $lookup: {
        from: 'permissions',
        localField: 'permissions',
        foreignField: '_id',
        as: 'permissions',
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        createdAt: 1,
        updatedAt: 1,
        isSystemRole: 1,
        'permissions._id': 1,
        'permissions.name': 1,
        'orgs._id': 1,
        'orgs.name': 1,
      },
    },
  ];

  const records = await RoleModel.aggregate(pipeline);

  return records.map((record) => {
    return {
      id: record._id.toHexString(),
      name: record.name,
      org:
        record.orgs.length === 0
          ? null
          : {
              id: record.orgs[0]._id.toHexString(),
              name: record.orgs[0].name,
            },
      description: record.description,
      isSystemRole: record.isSystemRole,
      permissions: record.permissions.map((permission) => {
        return {
          id: permission._id.toHexString(),
          name: permission.name,
        };
      }),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  });
}

/**
 * Counts roles in db matching the supplied props.
 * @param {Object} ctx - context
 * @property {MongooseConnection} ctx.db
 * @param {Object} props
 * @property {string} [props.q] - search query
 * @property {[string]} props.orgScope - array of org IDs to scope roles
 * @property {boolean} [props.isSystemRole] - indicates whether to return system roles
 * @return {Promise<number>}
 */
export async function getRoleCount({ db }, { q, orgScope, isSystemRole }) {
  const RoleModel = db.model('Role');

  const matchExpressions = [];

  if (!orgScope.includes(null)) {
    matchExpressions.push({
      scope: { $in: orgScope.map((scope) => ObjectId(scope)) },
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

  if (isSystemRole != null) {
    matchExpressions.push({
      isSystemRole: { $eq: isSystemRole },
    });
  }

  return RoleModel.countDocuments(matchExpressions.length !== 0 ? { $and: matchExpressions } : {});
}
