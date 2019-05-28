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
    collation: { locale: 'en', strength: 1 },
  }
);

userSchema.index(
  { 'emails.address': 1 },
  {
    unique: true,
    name: 'email_address_uidx',
    collation: { locale: 'en', strength: 1 },
  }
);

/**
 * Normalizes the designated username and returns a new string.
 * @param {string} username
 * @return {string} normalized username
 */
userSchema.statics.normalizeUsername = function(username) {
  return username.toLowerCase();
};

/**
 * Normalizes the designated email address and returns new string.
 * @param {string} emailAddress
 * @return {string} normalized email address
 */
userSchema.statics.normalizeEmailAddress = function(emailAddress) {
  return normalizeEmail(emailAddress);
};

/**
 * Retrieves the primary email address from the supplied emails array.
 * @param {Array<Object>} emails
 * @return {string|null} primary email address
 */
userSchema.statics.getPrimaryEmailAddress = function(emails) {
  const primaryEmail = emails.find((email) => email.isPrimary);

  if (primaryEmail) {
    return primaryEmail.address;
  }

  const headEmail = emails[0];

  if (headEmail) {
    return headEmail.address;
  }

  return null;
};

/**
 * Finds and returns the user's primary email address.
 * @return {string|null} primary email address
 */
userSchema.methods.findPrimaryEmail = function() {
  const primaryEmail = this.emails.find((email) => email.isPrimary);

  if (primaryEmail) {
    return primaryEmail.address;
  }

  return null;
};

/**
 * Finds and returns the user matching the .
 * @return {string|null} primary email address
 */
userSchema.static('findOneWithAuthFactors', async function(matchQuery) {
  const userRecords = await this.aggregate([
    {
      $match: matchQuery,
    },
    {
      $lookup: {
        from: 'authFactors',
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$user', '$$userId'],
              },
            },
          },
        ],
        as: 'authFactors',
      },
    },
    {
      $project: {
        _id: 1,
        username: 1,
        fullName: 1,
        picture: 1,
        emails: 1,
        deactivatedAt: 1,
        authFactors: '$authFactors',
      },
    },
    { $limit: 1 },
  ]).exec();

  return userRecords[0] || null;
});

export default userSchema;
