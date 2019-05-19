import { Schema } from 'mongoose';
import * as idpTypes from '../constants/idpTypes';
import { OAUTH } from '../constants/idpProtocols';

const identityProviderSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: Object.values(idpTypes),
    },
    org: {
      type: Schema.Types.ObjectId,
      required: false, // org missing implies global assigment
    },
    options: {
      type: Map,
      required: false,
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
  }
);

identityProviderSchema.index(
  { org: 1, type: 1 },
  {
    unique: true,
    name: 'org_idp_uidx',
  }
);

export default identityProviderSchema;
