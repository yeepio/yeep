import { Schema } from 'mongoose';

const emailSchema = new Schema({
  address: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
  isDefault: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
      minlength: 2,
    },
    password: {
      type: Buffer,
      required: true,
    },
    salt: {
      type: Buffer,
      required: true,
    },
    iterationCount: {
      type: Number,
      required: true,
      min: 1,
    },
    fullName: {
      type: String,
      required: false, // optional
      trim: true,
      maxlength: 100,
      minlength: 2,
    },
    picture: {
      type: String,
      required: false, // optional
      trim: true,
      maxlength: 500,
    },
    emails: [emailSchema],
    orgs: [Schema.Types.ObjectId],
    roles: [Schema.Types.ObjectId],
  },
  {
    collection: 'users',
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

userSchema.index(
  { 'emails.address': 1 },
  {
    unique: true,
    name: 'email_address_uidx',
  }
);

export default userSchema;
