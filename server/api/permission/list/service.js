import { ObjectId } from 'mongodb';
import escapeRegExp from 'lodash/escapeRegExp';

let cachedRequiredPermissionId;

export const stringifyCursor = ({ id }) => {
  return Buffer.from(JSON.stringify(id)).toString('base64');
};

export const parseCursor = (cursorStr) => {
  const id = JSON.parse(Buffer.from(cursorStr, 'base64').toString('utf8'));
  return { id };
};

async function findScopes(db, { userId, permissionId }) {
  const PermissionAssignmentModel = db.model('PermissionAssignment');

  const records = await PermissionAssignmentModel.aggregate([
    {
      $match: {
        user: ObjectId(userId),
        permission: ObjectId(permissionId),
      },
    },
    {
      $group: {
        _id: '$org',
      },
    },
  ]).exec();

  return records.map((record) => record._id);
}

async function listPermissions(db, { q, limit, cursor, userId }) {
  const PermissionModel = db.model('Permission');

  // retrieve read permission if not already in memory
  if (!cachedRequiredPermissionId) {
    const permission = await PermissionModel.findOne({
      name: 'yeep.permission.read',
    });
    cachedRequiredPermissionId = permission._id.toHexString();
  }

  // find org scopes the user has access to
  const scopes = await findScopes(db, {
    userId,
    permissionId: cachedRequiredPermissionId,
  });

  // retrieve permissions
  const permissions = await PermissionModel.aggregate([
    {
      $match: Object.assign(
        scopes.includes(null)
          ? {}
          : {
              scope: { $in: scopes },
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
        from: 'permissionAssignments',
        let: { permissionId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$permission', '$$permissionId'],
              },
            },
          },
          {
            $group: {
              _id: '$user',
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
