import { Schema } from 'mongoose';

const permissionSchema = new Schema(
  {
    name: {
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
    scope: Schema.Types.ObjectId,
  },
  {
    collection: 'permissions',
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

permissionSchema.index(
  { name: 1 },
  {
    unique: true,
    name: 'name_uidx',
    collation: { locale: 'en', strength: 1 },
  }
);

permissionSchema.index(
  { scope: 1 },
  {
    name: 'scope_idx',
  }
);

export default permissionSchema;
