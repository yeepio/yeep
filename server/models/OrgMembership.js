import { Schema } from 'mongoose';
import isString from 'lodash/isString';
import { ObjectId } from 'mongodb';
import typeOf from 'typeof';
import * as SortedUserPermissionArray from '../utils/SortedUserPermissionArray';

const permissionSchema = new Schema(
  {
    id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    resourceId: {
      type: Schema.Types.Mixed,
      required: false,
    },
  },
  {
    _id: false, // disable _id PK
  }
);

const roleSchema = new Schema(
  {
    id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    resourceId: {
      type: Schema.Types.Mixed,
      required: false,
    },
  },
  {
    _id: false, // disable _id PK
  }
);

const orgMembershipSchema = new Schema(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      required: false, // org missing implies global assigment
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    permissions: {
      type: [permissionSchema],
      required: false,
      default: [],
    },
    roles: {
      type: [roleSchema],
      required: false,
      default: [],
    },
    expiresAt: {
      type: Date,
      required: false,
      default: null,
    },
  },
  {
    collection: 'orgMemberships',
    autoIndex: false,
    bufferCommands: false,
    _id: true, // enable _id PK
    id: true, // i.e. create `id` getter to retrieve _id in hex format
    minimize: false, // allow empty object
    strict: true, // reject values not specified in schema
    validateBeforeSave: true,
    versionKey: '_v',
    timestamps: true,
  }
);

orgMembershipSchema.index(
  { orgId: 1, userId: 1 },
  {
    unique: true,
    name: 'membership_uidx',
  }
);

orgMembershipSchema.index(
  { userId: 1 },
  {
    name: 'user_idx',
  }
);

// set auto-expiration index based on `expiresAt`
orgMembershipSchema.index(
  { expiresAt: 1 },
  {
    name: 'expires_idx',
    sparse: true,
    expireAfterSeconds: 0,
  }
);

orgMembershipSchema.index(
  {
    'permissions.id': 1,
    'permissions.resourceId': 1,
  },
  {
    name: 'permissionAssignment_idx',
  }
);

orgMembershipSchema.index(
  {
    'roles.id': 1,
    'roles.resourceId': 1,
  },
  {
    name: 'roleAssignment_idx',
  }
);

/**
 * Retrieves permissions assigned to the designated user from db.
 * @param {Object} props
 * @property {string} props.userId - user ID
 * @property {string} [props.orgId] - org ID to retrieve permissions for (optional)
 * @property {[string]} [props.permissionScope] - array of permissions IDs to scope retrieved permissions (optional)
 * @returns {Promise<Array>}
 */
orgMembershipSchema.static('getUserPermissions', async function({
  userId,
  orgId,
  permissionScope,
}) {
  if (!isString(userId)) {
    throw new TypeError(`Invalid "userId" property; expected string, received ${typeOf(userId)}`);
  }

  if (orgId && !isString(orgId)) {
    throw new TypeError(`Invalid "orgId" propery; expected string, received ${typeOf(orgId)}`);
  }

  if (permissionScope && !Array.isArray(permissionScope)) {
    throw new TypeError(
      `Invalid "scope" propery; expected Array<string>, received ${typeOf(permissionScope)}`
    );
  }

  const records = await this.aggregate(
    [
      {
        $match: Object.assign(
          { userId: ObjectId(userId) },
          orgId ? { orgId: ObjectId(orgId) } : undefined
        ),
      },
      {
        $facet: {
          directPermissions: [
            { $unwind: '$permissions' },
            {
              $project: {
                _id: 0,
                orgId: '$orgId',
                permissionId: '$permissions.id',
                resourceId: '$permissions.resourceId',
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
          ],
          viaRole: [
            { $unwind: '$roles' },
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
                      permissions: 1,
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
            {
              $unwind: '$role.permissions',
            },
            {
              $lookup: {
                from: 'permissions',
                let: { permissionId: '$role.permissions' },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$_id', '$$permissionId'] },
                    },
                  },
                ],
                as: 'permissions',
              },
            },
            {
              $replaceRoot: {
                newRoot: {
                  orgId: '$orgId',
                  resourceId: '$resourceId',
                  role: '$role',
                  permission: { $arrayElemAt: ['$permissions', 0] },
                },
              },
            },
          ],
        },
      },
      permissionScope
        ? {
            $match: {
              'permission._id': {
                $in: permissionScope.map(ObjectId),
              },
            },
          }
        : null,
    ].filter(Boolean)
  );

  const permissions = [...records[0].directPermissions, ...records[0].viaRole].map((record) => ({
    id: record.permission._id.toHexString(),
    name: record.permission.name,
    isSystemPermission: record.permission.isSystemPermission,
    orgId: record.orgId ? record.orgId.toHexString() : null,
    resourceId: record.resourceId || null,
    roleId: record.role ? record.role._id.toHexString() : undefined,
  }));

  return SortedUserPermissionArray.sortDedup(permissions);
});

orgMembershipSchema.static('getUserOrgs', async function({ userId }) {
  if (!isString(userId)) {
    throw new TypeError(`Invalid "userId" property; expected string, received ${typeOf(userId)}`);
  }

  const records = await this.aggregate([
    {
      $match: {
        userId: ObjectId(userId),
        orgId: { $ne: null },
      },
    },
    {
      $lookup: {
        from: 'orgs',
        localField: 'orgId',
        foreignField: '_id',
        as: 'orgs',
      },
    },
  ]);

  return records;
});

export default orgMembershipSchema;
