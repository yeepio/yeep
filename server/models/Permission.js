import { Schema } from 'mongoose';

const permissionSchema = new Schema(
  {
    _id: {
      type: String,
      trim: true,
      required: true,
      minlength: 2,
      maxlength: 64,
    },
    description: {
      type: String,
      required: false,
      trim: true,
      maxlength: 140,
    },
    isSystemPermission: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    collection: 'permissions',
    autoIndex: false,
    bufferCommands: false,
    _id: true, // enable _id PK
    id: false, // i.e. create `id` getter to retrieve _id in hex format
    minimize: false, // allow empty object
    strict: true, // reject values not specified in schema
    validateBeforeSave: true,
    versionKey: '_v',
    timestamps: true,
  }
);

export default permissionSchema;
