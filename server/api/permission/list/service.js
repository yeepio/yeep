import { ObjectId } from 'mongodb';
import escapeRegExp from 'lodash/escapeRegExp';

export const stringifyCursor = ({ id }) => {
  return Buffer.from(JSON.stringify(id)).toString('base64');
};

export const parseCursor = (cursorStr) => {
  const id = JSON.parse(Buffer.from(cursorStr, 'base64').toString('utf8'));
  return { id };
};

async function listPermissions(db, { q, limit, cursor, scopes }) {
  const PermissionModel = db.model('Permission');

  // retrieve permissions
  const permissions = await PermissionModel.aggregate([
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
      $limit: limit,
    },
  ]);

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

export default listPermissions;
