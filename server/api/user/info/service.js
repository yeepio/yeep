import { ObjectId } from 'mongodb';
import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import sortBy from 'lodash/fp/sortBy';
import sortedUniqBy from 'lodash/fp/sortedUniqBy';
import { UserNotFoundError } from '../../../constants/errors';

const formatUserPermissions = flow(
  map((record) => ({
    id: record.permission._id.toHexString(),
    name: record.permission.name,
    isSystemPermission: record.permission.isSystemPermission,
    orgId: record.org ? record.org.toHexString() : '',
    resourceId: record.resource || '',
    roleId: record.role ? record.role.toHexString() : '',
  })),
  sortBy(['name', 'orgId', 'resourceId']),
  sortedUniqBy((permission) =>
    [permission.name, permission.orgId, permission.resourceId].filter(Boolean).join('::')
  )
);

async function getUserPermissions(db, { userId }) {
  const PermissionAssignmentModel = db.model('PermissionAssignment');
  const RoleAssignmentModel = db.model('RoleAssignment');

  const [permissionsDirect, permissionsViaRole] = await Promise.all([
    // get permissions directly assigned to user
    PermissionAssignmentModel.aggregate([
      {
        $match: {
          user: ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'permissions',
          localField: 'permission', // field in the orders collection
          foreignField: '_id', // field in the items collection
          as: 'permissions',
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            org: '$org',
            resource: '$resource',
            permission: { $arrayElemAt: ['$permissions', 0] },
          },
        },
      },
    ]),
    // get permissions assigned to user via role assignment(s)
    RoleAssignmentModel.aggregate([
      {
        $match: {
          user: ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'roles',
          let: { roleId: '$role' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$roleId'],
                },
              },
            },
            {
              $project: {
                _id: 0,
                permissions: 1,
              },
            },
          ],
          as: 'roles',
        },
      },
      {
        $unwind: '$roles',
      },
      {
        $unwind: '$roles.permissions',
      },
      {
        $project: {
          _id: 0,
          org: '$org',
          resource: '$resource',
          role: '$role',
          permission: '$roles.permissions',
        },
      },
      {
        $lookup: {
          from: 'permissions',
          localField: 'permission',
          foreignField: '_id',
          as: 'permission',
        },
      },
      {
        $unwind: '$permission',
      },
    ]),
  ]);

  return formatUserPermissions(permissionsDirect.concat(permissionsViaRole));
}

const formatRoles = flow(
  map((record) => ({
    id: record.role._id.toHexString(),
    name: record.role.name,
    isSystemRole: record.role.isSystemRole,
    orgId: record.org ? record.org.toHexString() : '',
    resourceId: record.resource || '',
  })),
  sortBy(['name', 'orgId', 'resourceId'])
);

async function getUserRoles(db, { userId }) {
  const RoleAssignmentModel = db.model('RoleAssignment');

  const roles = await RoleAssignmentModel.aggregate([
    {
      $match: {
        user: ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: 'roles',
        let: { roleId: '$role' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$roleId'],
              },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              isSystemRole: 1,
            },
          },
        ],
        as: 'roles',
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          org: '$org',
          resource: '$resource',
          role: { $arrayElemAt: ['$roles', 0] },
        },
      },
    },
  ]);

  return formatRoles(roles);
}

async function getUserInfo(db, { id, projection = {} }) {
  const UserModel = db.model('User');

  // ensure user exists
  const user = await UserModel.findOne({ _id: ObjectId(id) });

  if (!user) {
    throw new UserNotFoundError('User does not exist');
  }

  // retrieve user permissions
  let permissions;

  if (projection.permissions) {
    permissions = await getUserPermissions(db, { userId: id });
  }

  // retrieve user roles
  let roles;

  if (projection.roles) {
    roles = await getUserRoles(db, { userId: id });
  }

  return {
    id: user._id.toHexString(),
    username: user.username,
    fullName: user.fullName,
    picture: user.picture,
    emails: user.emails,
    orgs: user.orgs.map((oid) => oid.toHexString()),
    permissions,
    roles,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export default getUserInfo;
export { getUserPermissions };
