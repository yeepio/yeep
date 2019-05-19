import { Schema } from 'mongoose';

const oauthIdentityProviderSchema = new Schema(
  {
    clientId: {
      type: String,
      maxlength: 60,
      required: true,
    },
    clientSecret: {
      type: String,
      maxlength: 300,
      required: true,
    },
  },
  {
    collection: 'identityProviders',
    autoIndex: false,
    bufferCommands: false,
    _id: true, // enable _id PK
    id: true, // i.e. create `id` getter to retrieve _id in hex format
    minimize: false, // allow empty object
    strict: true, // reject values not specified in schema
    validateBeforeSave: true,
    versionKey: '_v',
    timestamps: true,
    discriminatorKey: 'protocol',
  }
);

export default oauthIdentityProviderSchema;
