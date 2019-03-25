import { ObjectId } from 'mongodb';
import pick from 'lodash/pick';
import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import sortBy from 'lodash/fp/sortBy';
import sortedUniqBy from 'lodash/fp/sortedUniqBy';
import { UserNotFoundError } from '../../../constants/errors';

export const defaultProjection = {
  id: true,
  username: true,
  fullName: true,
  picture: true,
  emails: true,
  orgs: true,
  permissions: false,
  roles: false,
  createdAt: true,
  updatedAt: true,
};

const formatUserPermissions = flow(
  map((record) => ({
    id: record.permission._id.toHexString(),
    name: record.permission.name,
    isSystemPermission: record.permission.isSystemPermission,
    orgId: record.orgId ? record.orgId.toHexString() : '',
    resourceId: record.resourceId || '',
    roleId: record.roleId ? record.roleId.toHexString() : '',
  })),
  sortBy(['name', 'orgId', 'resourceId']),
  sortedUniqBy((permission) =>
    [permission.name, permission.orgId, permission.resourceId].filter(Boolean).join(':')
  )
);

async function getUserPermissions({ db }, { userId }) {
  const OrgMembershipModel = db.model('OrgMembership');

  const [permissionsDirect, permissionsViaRole] = await Promise.all([
    // get permissions directly assigned to user
    OrgMembershipModel.aggregate([
      {
        $match: {
          userId: ObjectId(userId),
        },
      },
      {
        $unwind: '$permissions',
      },
      {
        $project: {
          _id: 0,
          orgId: '$orgId',
          permissionId: '$permissions.id',
          resourceId: '$roles.resourceId',
        },
      },
      {
        $lookup: {
          from: 'permissions',
          localField: 'permissionId',
          foreignField: '_id',
          as: 'permissions',
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            orgId: '$orgId',
            resourceId: '$resourceId',
            permission: { $arrayElemAt: ['$permissions', 0] },
          },
        },
      },
    ]),
    // get permissions assigned to user via role assignment(s)
    OrgMembershipModel.aggregate([
      {
        $match: {
          userId: ObjectId(userId),
        },
      },
      {
        $unwind: '$roles',
      },
      {
        $project: {
          _id: 0,
          orgId: '$orgId',
          roleId: '$roles.id',
          resourceId: '$roles.resourceId',
        },
      },
      {
        $lookup: {
          from: 'roles',
          let: { roleId: '$roleId' },
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
          orgId: '$orgId',
          resourceId: '$resourceId',
          roleId: '$roleId',
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
    orgId: record.orgId ? record.orgId.toHexString() : '',
    resourceId: record.resourceId || '',
  })),
  sortBy(['name', 'orgId', 'resourceId'])
);

async function getUserRoles({ db }, { userId }) {
  const OrgMembershipModel = db.model('OrgMembership');

  const roles = await OrgMembershipModel.aggregate([
    {
      $match: {
        userId: ObjectId(userId),
      },
    },
    {
      $unwind: '$roles',
    },
    {
      $project: {
        _id: 0,
        orgId: '$orgId',
        roleId: '$roles.id',
        resourceId: '$roles.resourceId',
      },
    },
    {
      $lookup: {
        from: 'roles',
        let: { roleId: '$roleId' },
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
          orgId: '$orgId',
          resourceId: '$resourceId',
          role: { $arrayElemAt: ['$roles', 0] },
        },
      },
    },
  ]);

  return formatRoles(roles);
}

async function getUserOrgs({ db }, { userId }) {
  const OrgMembershipModel = db.model('OrgMembership');

  const records = await OrgMembershipModel.find(
    {
      userId: ObjectId(userId),
      orgId: { $ne: null },
    },
    {
      orgId: 1,
    }
  );

  return records.map((record) => record.orgId.toHexString());
}

async function getUserInfo({ db }, { id, projection = defaultProjection }) {
  const UserModel = db.model('User');

  // retrieve user details
  const user = await UserModel.findOne({ _id: ObjectId(id) });

  // ensure user exists
  if (!user) {
    throw new UserNotFoundError('User does not exist');
  }

  // retrieve user orgs
  let orgs;

  if (projection.orgs) {
    orgs = await getUserOrgs({ db }, { userId: id });
  }

  // retrieve user permissions
  let permissions;

  if (projection.permissions) {
    permissions = await getUserPermissions({ db }, { userId: id });
  }

  // retrieve user roles
  let roles;

  if (projection.roles) {
    roles = await getUserRoles({ db }, { userId: id });
  }

  // determine projection fields
  const fields = Object.entries(projection).reduce((accumulator, [key, value]) => {
    if (value) {
      return accumulator.concat(key);
    }
    return accumulator;
  }, []);

  // Please note: if you add a new prop to user, remember to update the defaultProjection obj
  return pick(
    {
      id: user._id.toHexString(),
      username: user.username,
      fullName: user.fullName,
      picture: user.picture,
      emails: user.emails,
      orgs,
      permissions,
      roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    fields
  );
}

export default getUserInfo;
export { getUserPermissions };
