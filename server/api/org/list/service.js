import { ObjectId } from 'mongodb';
// import has from 'lodash/has';
import escapeRegExp from 'lodash/escapeRegExp';

export const stringifyCursor = ({ id }) => {
  return Buffer.from(JSON.stringify(id)).toString('base64');
};

export const parseCursor = (cursorStr) => {
  const id = JSON.parse(Buffer.from(cursorStr, 'base64').toString('utf8'));
  return { id };
};

async function listOrgs({ db }, { q, limit, scopes, cursor }) {
  const OrgModel = db.model('Org');

  const matchExpressions = [];

  // Should we call scopes, orgs here?
  if (!scopes.includes(null)) {
    matchExpressions.push({
      _id: { $in: scopes.map((scope) => ObjectId(scope)) },
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

  // retrieve orgs
  const orgs = await OrgModel.aggregate([
    {
      $match: { $and: matchExpressions },
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
            $group: {
              _id: '$userId',
            },
          },
        ],
        as: 'users',
      },
    },
    {
      $limit: limit,
    },
  ]);

  return orgs.map((org) => ({
    id: org._id.toHexString(),
    name: org.name,
    slug: org.slug,
    usersCount: org.users.length,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
  }));
}

export default listOrgs;
