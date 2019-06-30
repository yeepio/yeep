import { Schema } from 'mongoose';

const permissionSchema = new Schema(
  {
    id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    resourceId: {
      type: Schema.Types.Mixed,
      required: false,
    },
  },
  {
    _id: false, // disable _id PK
  }
);

const roleSchema = new Schema(
  {
    id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    resourceId: {
      type: Schema.Types.Mixed,
      required: false,
    },
  },
  {
    _id: false, // disable _id PK
  }
);

/**
 * InvitationToken is a discriminator of Token.
 * @see {@link https://mongoosejs.com/docs/discriminators.html}
 */
const invitationTokenSchema = new Schema(
  {
    invitee: {
      emailAddress: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },
      permissions: {
        type: [permissionSchema],
        required: false,
        default: [],
      },
      roles: {
        type: [roleSchema],
        required: false,
        default: [],
      },
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
    timestamps: true,
    discriminatorKey: 'type',
  }
);

export default invitationTokenSchema;
