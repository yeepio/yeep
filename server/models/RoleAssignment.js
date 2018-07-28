import { Schema } from 'mongoose';

const roleAssignmentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    org: {
      type: Schema.Types.ObjectId,
      required: false, // org missing implies global assigment
    },
    role: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    collection: 'roleAssignments',
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

roleAssignmentSchema.index(
  { user: 1, org: 1, role: 1 },
  {
    unique: true,
    name: 'assignment_uidx',
  }
);

export default roleAssignmentSchema;
