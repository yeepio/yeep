import crypto from 'crypto';
import Promise from 'bluebird';
import base32 from 'thirty-two';
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

/**
 * Generates and returns a time-based SOTP token based on the supplied secret key.
 * @param {String} secretKey
 * @param {Number} [windowIndex=0] use window index to retrieve previous or next tokens
 * @return {String}
 * @see {@link https://github.com/gfiocco/google-auth-totp}
 * @license
 * MIT License
 *
 * Copyright (c) 2017 gfiocco
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
credentialSchema.statics.getSOTP = function(secretKey, windowIndex = 0) {
  // calculate number of 30-seconds intervals from epoch time, encode this to hex and then 0-pad to obtain a 12 character string.
  // finally place this hex string into a buffer.
  var message = Buffer.from(
    Array(16)
      .fill(0)
      .concat((Math.floor(Math.round(Date.now() / 1000) / 30) + windowIndex).toString(16))
      .join('')
      .slice(-16),
    'hex'
  );

  // decode secretKey from base32 and place it into a buffer
  var key = Buffer.from(base32.decode(secretKey), 'utf8');

  // FYI - we have stored the message and secret into the buffer because the crypto hmac function requires buffer inputs

  // use crypto to obtain an SH1 HMAC digest from the key and message
  var hmac = crypto.createHmac('sha1', key); // create Hmac instances
  hmac.setEncoding('hex'); // instruct the Hmac instance that mssg is hex encoded
  hmac.update(message);
  hmac.end();
  hmac = hmac.read(); // the SH1 HMAC output

  // bitwise operations to convert the SH1 HMAC output into a 6 digits code
  return ((parseInt(hmac.substr(parseInt(hmac.slice(-1), 16) * 2, 8), 16) & 2147483647) + '').slice(
    -6
  );
};

export default credentialSchema;
