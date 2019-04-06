import { Schema } from 'mongoose';

const authFactorSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    type: {
      type: String,
      enum: ['PASSWORD', 'TOTP'],
      required: true,
    },
  },
  {
    collection: 'authFactors',
    autoIndex: false,
    bufferCommands: false,
    _id: true, // enable _id PK
    id: true, // i.e. create `id` getter to retrieve _id in hex format
    minimize: false, // allow empty object
    strict: true, // reject values not specified in schema
    validateBeforeSave: true,
    versionKey: '_v',
    timestamps: true,
    discriminatorKey: 'type',
  }
);

authFactorSchema.index(
  { user: 1, type: 1 },
  {
    unique: true,
    name: 'user_factor_uidx',
  }
);

export default authFactorSchema;
