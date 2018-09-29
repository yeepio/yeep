import { Schema } from 'mongoose';
import normalizeEmail from 'normalize-email';

const emailSchema = new Schema(
  {
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
    isPrimary: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    _id: false, // disable _id PK
  }
);

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: false,
      trim: true,
      maxlength: 30,
      minlength: 2,
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
    deactivatedAt: {
      type: Date,
      required: false, // optional
    },
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
  { username: 1 },
  {
    unique: true,
    sparse: true,
    name: 'username_uidx',
    collation: { locale: 'en', strength: 2 },
  }
);

userSchema.index(
  { 'emails.address': 1 },
  {
    unique: true,
    name: 'email_address_uidx',
    collation: { locale: 'en', strength: 2 },
  }
);

/**
 * Normalizes the designated username and returns a new string.
 * @param {String} username
 * @return {String} normalized username
 */
userSchema.statics.normalizeUsername = function(username) {
  return username.normalize('NFKC').toLowerCase();
};

/**
 * Normalizes the designated email address and returns new string.
 * @param {String} emailAddress
 * @return {String} normalized email address
 */
userSchema.statics.normalizeEmailAddress = function(emailAddress) {
  return normalizeEmail(emailAddress);
};

export default userSchema;
