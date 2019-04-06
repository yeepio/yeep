import crypto from 'crypto';
import Promise from 'bluebird';
import { Schema } from 'mongoose';

const randomBytes = Promise.promisify(crypto.randomBytes);
const pbkdf2 = Promise.promisify(crypto.pbkdf2);

/**
 * Password is a discriminator of AuthFactor.
 * @see {@link https://mongoosejs.com/docs/discriminators.html}
 */
const passwordSchema = new Schema(
  {
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

/**
 * Generates and returns a cryptographically secure pseudorandom buffer of 30 bytes.
 * @return {Promise<Buffer>} a Bluebird promise resolving to a Buffer.
 */
passwordSchema.statics.generatePassword = function() {
  return randomBytes(30);
};

/**
 * Generates and returns a cryptographically secure pseudorandom buffer of 128 bytes.
 * @return {Promise<Buffer>} a Bluebird promise resolving to a Buffer.
 */
passwordSchema.statics.generateSalt = function() {
  return randomBytes(128);
};

/**
 * Returns a secure hash of the designated password using the supplied salt and iterations count.
 * @param {string} password
 * @param {Buffer} salt
 * @param {number} iterations
 * @return {Promise<Buffer>}
 */
passwordSchema.statics.digestPassword = function(password, salt, iterations) {
  return pbkdf2(password, salt, iterations, 128, 'sha512');
};

export default passwordSchema;
