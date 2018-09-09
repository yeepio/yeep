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

async function listRoles(db, { q, limit, cursor, userId }) {
  const PermissionModel = db.model('Permission');
  const RoleModel = db.model('Role');

  // retrieve read permission if not already in memory
  if (!cachedRequiredPermissionId) {
    const permission = await PermissionModel.findOne(
      {
        name: 'yeep.role.read',
      },
      {
        _id: 1,
      }
    );
    cachedRequiredPermissionId = permission._id.toHexString();
  }

  // find org scopes the user has access to
  const scopes = await findScopes(db, {
    userId,
    permissionId: cachedRequiredPermissionId,
  });

  console.log(scopes);

  // retrieve roles
  const roles = await RoleModel.aggregate([
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
        from: 'roleAssignments',
        let: { roleId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$role', '$$roleId'],
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
      $limit: limit,
    },
  ]);

  return roles.map((role) => ({
    id: role._id.toHexString(),
    name: role.name,
    description: role.description,
    isSystemRole: role.isSystemRole,
    permissions: role.permissions,
    usersCount: role.users.length,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  }));
}

export default listRoles;
