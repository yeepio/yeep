import { Schema } from 'mongoose';

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

export default orgMembershipSchema;
