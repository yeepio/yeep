import { ObjectId } from 'mongodb';
import get from 'lodash/get';
import { OrgNotFoundError } from '../../../constants/errors';

export async function getOrgInfo({ db }, { id }) {
  const OrgModel = db.model('Org');

  const pipeline = [
    {
      $match: { _id: ObjectId(id) },
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
    },
  ];

  const records = await OrgModel.aggregate(pipeline);

  if (records.length === 0) {
    throw new OrgNotFoundError(`Org ${id} not found`);
  }

  const record = records[0];
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
}
