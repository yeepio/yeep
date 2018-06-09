import { Schema } from 'mongoose';

const orgSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      minlength: 2,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
      minlength: 2,
      lowercase: true,
    },
  },
  {
    collection: 'orgs',
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

orgSchema.index(
  { slug: 1 },
  {
    unique: true,
    name: 'org_slug_uidx',
    collation: { locale: 'en', strength: 2 },
  }
);

export default orgSchema;
