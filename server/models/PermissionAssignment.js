import { Schema } from 'mongoose';

const permissionAssignmentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    org: {
      type: Schema.Types.ObjectId,
      required: false, // org missing implies global assigment
    },
    permission: {
      type: String,
      required: true,
      trim: true,
    },
    resource: {
      type: Schema.Types.Mixed,
      required: false,
    },
  },
  {
    collection: 'permissionAssignments',
    autoIndex: false,
    bufferCommands: false,
    _id: true, // enable _id PK
    id: true, // i.e. create `id` getter to retrieve _id in hex format
    minimize: false, // allow empty object
    strict: true, // reject values not specified in schema
    validateBeforeSave: true,
    versionKey: '_v',
    timestamps: false,
  }
);

permissionAssignmentSchema.index(
  { user: 1, org: 1, permission: 1, resource: 1 },
  {
    unique: true,
    name: 'assignment_uidx',
  }
);

export default permissionAssignmentSchema;
