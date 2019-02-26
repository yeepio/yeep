import { ObjectId } from 'mongodb';
import escapeRegExp from 'lodash/escapeRegExp';

export const stringifyCursor = ({ id }) => {
  return Buffer.from(JSON.stringify(id)).toString('base64');
};

export const parseCursor = (cursorStr) => {
  const id = JSON.parse(Buffer.from(cursorStr, 'base64').toString('utf8'));
  return { id };
};

async function listPermissions(db, { q, limit, cursor, scopes, role, isSystemPermission }) {
  const PermissionModel = db.model('Permission');

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

  if (role) {
    matchExpressions.push({
      _id: { $in: role.permissions.map((permission) => ObjectId(permission)) },
    });
  }

  if (isSystemPermission) {
    matchExpressions.push({
      isSystemPermission: { $eq: isSystemPermission },
    });
  }

  // retrieve permissions
  const permissions = await PermissionModel.aggregate([
    {
      $match: { $and: matchExpressions },
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
      $sort: {
        _id: 1,
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
