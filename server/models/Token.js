import { Schema } from 'mongoose';
import randomstring from 'randomstring';

const tokenSchema = new Schema(
  {
    secret: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      minlength: 6,
    },
    type: {
      type: String,
      required: true,
      enum: ['AUTHENTICATION'],
    },
    payload: {
      type: Map,
      required: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: false,
    },
  },
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
    timestamps: false,
  }
);

tokenSchema.index({ secret: 'hashed' }, { name: 'secret_idx' });
tokenSchema.index({ userId: 1 }, { name: 'userId_idx' });

/**
 * Generates and returns secret with the designated properties.
 * @param {Object} [props]
 * @property {number} [props.length=32]
 * @property {boolean} [props.readable=true]
 * @property {string} [props.charset=alphanumeric]
 * @returns {string}
 * @see {@link https://github.com/klughammer/node-randomstring#api} for further info on this method properties.
 */
tokenSchema.statics.generateSecret = function(props = {}) {
  const { length = 32, readable = true, charset = 'alphanumeric' } = props;

  return randomstring.generate({
    length,
    readable,
    charset,
    ...props,
  });
};

export default tokenSchema;
