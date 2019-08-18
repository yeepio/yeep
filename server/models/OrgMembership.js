import { Schema } from 'mongoose';
import isPlainObject from 'lodash/isPlainObject';
import isString from 'lodash/isString';
import { ObjectId } from 'mongodb';
import typeOf from 'typeof';

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

orgMembershipSchema.static('getUserPermissions', async function({ user, org, scope }) {
  if (!isString(user)) {
    throw new TypeError(`Invalid "user" property; expected string, received ${typeOf(user)}`);
  }

  if (org && !isString(org)) {
    throw new TypeError(`Invalid "org" propery; expected string, received ${typeOf(org)}`);
  }

  if (scope && !Array.isArray(scope)) {
    throw new TypeError(
      `Invalid "scope" propery; expected Array<string>, received ${typeOf(scope)}`
    );
  }

  const records = await this.aggregate(
    [
      {
        $match: {
          userId: ObjectId(user),
          orgId: org ? ObjectId(org) : undefined,
        },
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
      scope
        ? {
            $match: {
              'permission._id': {
                $in: scope.map(ObjectId),
              },
            },
          }
        : undefined,
      {
        $sort: {
          'permission.name': 1,
          orgId: 1,
          resourceId: 1,
        },
      },
    ].filter(Boolean)
  );

  return [...records.directPermissions, ...records.viaRole].map((record) => {
    return {
      id: record.permission._id.toHexString(),
      name: record.permission.name,
      isSystemPermission: record.permission.isSystemPermission,
      orgId: record.orgId ? record.orgId.toHexString() : null,
      resourceId: record.oresourceId,
      roleId: record.role ? record.role._id.toHexString() : undefined,
    };
  });
});

export default orgMembershipSchema;
