import { ObjectId } from 'mongodb';
import escapeRegExp from 'lodash/escapeRegExp';
import invokeMap from 'lodash/invokeMap';
import pick from 'lodash/pick';
import get from 'lodash/get';

export const stringifyCursor = ({ id }) => {
  return Buffer.from(JSON.stringify(id)).toString('base64');
};

export const parseCursor = (cursorStr) => {
  const id = JSON.parse(Buffer.from(cursorStr, 'base64').toString('utf8'));
  return { id };
};

export const defaultProjection = {
  id: true,
  username: true,
  fullName: true,
  picture: true,
  emails: true,
  orgs: true,
  createdAt: true,
  updatedAt: true,
};

export async function getUsers(
  { db },
  { q, limit, cursor, orgScope, projection = defaultProjection }
) {
  const UserModel = db.model('User');
  const matchExpressions = [];

  if (q) {
    matchExpressions.push({
      username: {
        $regex: `^${escapeRegExp(q)}`,
        $options: 'i',
      },
    });
  }

  // handle pagination
  if (cursor) {
    matchExpressions.push({
      _id: { $gt: ObjectId(cursor.id) },
    });
  }

  // init pipeline - retrieve users
  const pipeline = [
    {
      $match:
        matchExpressions.length !== 0
          ? {
              $and: matchExpressions,
            }
          : {},
    },
  ];

  // scope by org membership
  pipeline.push(
    {
      $lookup: {
        from: 'orgMemberships',
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$userId', '$$userId'] },
                  orgScope.length !== 0
                    ? {
                        $in: ['$orgId', orgScope.map((scope) => ObjectId(scope))],
                      }
                    : null,
                ].filter(Boolean),
              },
            },
          },
          {
            $project: {
              _id: 0,
              orgId: 1,
            },
          },
        ],
        as: 'memberships',
      },
    },
    {
      $match: {
        memberships: { $ne: [] },
      },
    }
  );

  // impose page limit
  pipeline.push({
    $limit: limit,
  });

  const records = await UserModel.aggregate(pipeline);

  const fields = Object.entries(projection).reduce((accumulator, [key, value]) => {
    return value ? [...accumulator, key] : accumulator;
  }, []);

  return records.map((record) => {
    // Please note: if you add a new prop to user, remember to update the defaultProjection obj
    const obj = {
      id: record._id.toHexString(),
      username: record.username,
      fullName: record.fullName,
      picture: record.picture,
      emails: record.emails,
      orgs: invokeMap(record.memberships, 'orgId.toHexString'),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return pick(obj, fields);
  });
}

export async function getUserCount({ db }, { q, orgScope = [] }) {
  const UserModel = db.model('User');

  const matchExpressions = [];

  if (q) {
    matchExpressions.push({
      username: {
        $regex: `^${escapeRegExp(q)}`,
        $options: 'i',
      },
    });
  }

  const pipeline = [
    {
      $match:
        matchExpressions.length !== 0
          ? {
              $and: matchExpressions,
            }
          : {},
    },
    {
      $lookup: {
        from: 'orgMemberships',
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$userId', '$$userId'] },
                  orgScope.length !== 0
                    ? {
                        $in: ['$orgId', orgScope.map((scope) => ObjectId(scope))],
                      }
                    : null,
                ].filter(Boolean),
              },
            },
          },
          {
            $project: {
              _id: 0,
              orgId: 1,
            },
          },
        ],
        as: 'memberships',
      },
    },
    {
      $match: {
        memberships: { $ne: [] },
      },
    },
  ];

  pipeline.push({
    $count: 'count',
  });

  const records = await UserModel.aggregate(pipeline);
  return get(records, [0, 'count'], 0);
}
