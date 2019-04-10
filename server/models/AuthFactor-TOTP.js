import crypto from 'crypto';
import base32 from 'thirty-two';
import { Schema } from 'mongoose';
import randomstring from 'randomstring';

/**
 * TOTP is a discriminator of AuthFactor.
 * @see {@link https://mongoosejs.com/docs/discriminators.html}
 */
const totpSchema = new Schema(
  {
    secret: {
      type: String,
      maxlength: 64,
      minlength: 32,
      required: true,
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
 * Generates and returns a BASE-32 encoded secret key.
 * @return {String}
 */
totpSchema.statics.generateSecret = () => {
  // TODO: Replace randomstring.generate with async version
  // @see https://github.com/klughammer/node-randomstring/issues/28
  return randomstring.generate({
    length: 32,
    readable: false,
    charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567', // i.e. Base32 characters
  });
};

/**
 * Generates and returns a TOTP token based on the supplied secret key.
 * @param {String} secret
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
totpSchema.statics.getToken = (secret, windowIndex = 0) => {
  // calculate number of 30-seconds intervals from epoch time, encode this to hex and then 0-pad to obtain a 12 character string.
  // finally place this hex string into a buffer.
  const message = Buffer.from(
    Array(16)
      .fill(0)
      .concat((Math.floor(Math.round(Date.now() / 1000) / 30) + windowIndex).toString(16))
      .join('')
      .slice(-16),
    'hex'
  );

  // decode secret from base32 and place it into a buffer
  const key = Buffer.from(base32.decode(secret), 'utf8');

  // FYI - we have stored the message and secret into the buffer because the crypto hmac function requires buffer inputs

  // use crypto to obtain an SH1 HMAC digest from the key and message
  const hmac = crypto.createHmac('sha1', key); // create Hmac instances
  hmac.setEncoding('hex'); // instruct the Hmac instance that mssg is hex encoded
  hmac.update(message);
  hmac.end();

  // bitwise operations to convert the SH1 HMAC output into a 6 digits code
  const data = hmac.read(); // the SH1 HMAC output
  return ((parseInt(data.substr(parseInt(data.slice(-1), 16) * 2, 8), 16) & 2147483647) + '').slice(
    -6
  );
};

/**
 * Verifies the specified token based on the supplied secret key.
 * @param {String} token
 * @param {String} secret
 * @return {Boolean}
 */
totpSchema.statics.verifyToken = (token, secret) => {
  return (
    totpSchema.statics.getToken(secret, 0) === token ||
    totpSchema.statics.getToken(secret, -1) === token
  );
};

export default totpSchema;
