import { Schema } from 'mongoose';

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

export default tokenSchema;
