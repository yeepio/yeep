import crypto from 'crypto';
import Promise from 'bluebird';
import { Schema } from 'mongoose';

const randomBytes = Promise.promisify(crypto.randomBytes);
const pbkdf2 = Promise.promisify(crypto.pbkdf2);

const credentialSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    type: {
      type: String,
      enum: ['PASSWORD'],
      required: true,
    },
    password: {
      type: Buffer,
      required: function() {
        return this.type === 'PASSWORD';
      },
    },
    salt: {
      type: Buffer,
      required: function() {
        return this.type === 'PASSWORD';
      },
    },
    iterationCount: {
      type: Number,
      required: function() {
        return this.type === 'PASSWORD';
      },
      min: 1,
    },
  },
  {
    collection: 'credentials',
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

// user can only have one password
credentialSchema.index(
  { user: 1 },
  {
    unique: true,
    name: 'user_password_uidx',
    partialFilterExpression: { type: { $eq: 'PASSWORD' } },
  }
);

/**
 * Generates and returns a cryptographically secure pseudorandom buffer of 30 bytes.
 * @return {Promise<Buffer>} a Bluebird promise resolving to a Buffer.
 */
credentialSchema.statics.generatePassword = function() {
  return randomBytes(30);
};

/**
 * Generates and returns a cryptographically secure pseudorandom buffer of 128 bytes.
 * @return {Promise<Buffer>} a Bluebird promise resolving to a Buffer.
 */
credentialSchema.statics.generateSalt = function() {
  return randomBytes(128);
};

/**
 * Returns a secure hash of the designated password using the supplied salt and iterations count.
 * @param {string} password
 * @param {Buffer} salt
 * @param {number} iterations
 * @return {Promise<Buffer>}
 */
credentialSchema.statics.digestPassword = function(password, salt, iterations) {
  return pbkdf2(password, salt, iterations, 128, 'sha512');
};

export default credentialSchema;
