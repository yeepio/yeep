import { Schema } from 'mongoose';

const settingsSchema = new Schema(
  {
    isUsernameEnabled: {
      type: Boolean,
      required: false,
    },
  },
  {
    collection: 'settings',
    autoIndex: false,
    bufferCommands: false,
    _id: true, // enable _id PK
    id: true, // i.e. create `id` getter to retrieve _id in hex format
    minimize: false, // allow empty object
    strict: false, // reject values not specified in schema
    validateBeforeSave: true,
    versionKey: '_v',
    timestamps: false,
  }
);

export default settingsSchema;
