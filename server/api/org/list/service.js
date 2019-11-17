import { ObjectId } from 'mongodb';
import get from 'lodash/get';
import escapeRegExp from 'lodash/escapeRegExp';

export function stringifyCursor({ id }) {
  return Buffer.from(JSON.stringify(id)).toString('base64');
}

export function parseCursor(cursorStr) {
  const id = JSON.parse(Buffer.from(cursorStr, 'base64').toString('utf8'));
  return { id };
}

export async function getOrgs({ db }, { q, orgScope, user, limit, cursor }) {
  const OrgModel = db.model('Org');

  const matchExpressions = [];

  if (orgScope.length !== 0) {
    matchExpressions.push({
      _id: { $in: orgScope.map(ObjectId) },
    });
  }

  if (q) {
    matchExpressions.push({
      $text: {
        $search: q,
      },
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
      $match:
        matchExpressions.length !== 0
          ? {
              $and: matchExpressions,
            }
          : {},
    },
  ];

  if (user) {
    pipeline.push(
      {
        $lookup: {
          from: 'orgMemberships',
          let: { orgId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$orgId', '$$orgId'] }, { $eq: ['$userId', ObjectId(user)] }],
                },
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
  }

  pipeline.push(
    {
      $limit: limit,
    },
    {
      $lookup: {
        from: 'orgMemberships',
        let: { orgId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$orgId', '$$orgId'],
              },
            },
          },
          {
            $count: 'count',
          },
        ],
        as: 'users',
      },
    },
    {
      $lookup: {
        from: 'roles',
        let: { scope: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$scope', '$$scope'],
              },
            },
          },
          {
            $count: 'count',
          },
        ],
        as: 'roles',
      },
    },
    {
      $lookup: {
        from: 'permissions',
        let: { scope: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$scope', '$$scope'],
              },
            },
          },
          {
            $count: 'count',
          },
        ],
        as: 'permissions',
      },
    }
  );

  const records = await OrgModel.aggregate(pipeline);

  return records.map((record) => {
    return {
      id: record._id.toHexString(),
      name: record.name,
      slug: record.slug,
      usersCount: get(record, ['users', 0, 'count'], 0),
      rolesCount: get(record, ['roles', 0, 'count'], 0),
      permissionsCount: get(record, ['permissions', 0, 'count'], 0),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  });
}

export async function getOrgsCount({ db }, { q, orgScope = [], user }) {
  const OrgModel = db.model('Org');

  const matchExpressions = [];

  if (orgScope.length !== 0) {
    matchExpressions.push({
      _id: { $in: orgScope.map(ObjectId) },
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

  if (user) {
    pipeline.push(
      {
        $lookup: {
          from: 'orgMemberships',
          let: {
            orgId: '$_id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$orgId', '$$orgId'] }, { $eq: ['$userId', ObjectId(user)] }],
                },
              },
            },
            {
              $group: { _id: '$orgId' },
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
  }

  pipeline.push({
    $count: 'count',
  });

  const records = await OrgModel.aggregate(pipeline);
  return get(records, [0, 'count'], 0);
}
