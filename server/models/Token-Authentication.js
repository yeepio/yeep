import { Schema } from 'mongoose';

/**
 * AuthenticationToken is a discriminator of Token.
 * @see {@link https://mongoosejs.com/docs/discriminators.html}
 */
const authenticatonTokenSchema = new Schema(
  {},
  {
    collection: 'tokens',
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

export default authenticatonTokenSchema;
