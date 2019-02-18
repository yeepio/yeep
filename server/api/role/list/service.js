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

async function listRoles(db, { q, limit, cursor, scopes }) {
  const RoleModel = db.model('Role');

  // retrieve roles
  const roles = await RoleModel.aggregate([
    {
      $match: Object.assign(
        scopes.includes(null)
          ? {}
          : {
              scope: { $in: scopes.map((scope) => ObjectId(scope)) },
            },
        q
          ? {
              name: {
                $regex: `^${escapeRegExp(q)}`,
                $options: 'i',
              },
            }
          : {},
        cursor
          ? {
              _id: {
                $gt: ObjectId(cursor.id),
              },
            }
          : {}
      ),
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

  return roles.map((role) => ({
    id: role._id.toHexString(),
    name: role.name,
    org: has(role, ['org', '_id']) ? {
      id: role.org._id.toHexString(),
      name: role.org.name,
    } : null,
    description: role.description,
    isSystemRole: role.isSystemRole,
    permissions: role.permissions,
    usersCount: role.users.length,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  }));
}

export default listRoles;
