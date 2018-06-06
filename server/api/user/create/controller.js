import Joi from 'joi';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { createValidationMiddleware } from '../../../middleware/validation';
import { getGravatarUrl } from '../../../utils/gravatar';
import {
  InvalidPrimaryEmailError,
  DuplicateEmailAddressError,
  DuplicateUsernameError,
} from '../../../constants/errors';

const validation = createValidationMiddleware({
  body: {
    username: Joi.string()
      .lowercase()
      .trim()
      .min(2)
      .max(30)
      .required()
      .regex(/^[A-Za-z0-9_\-.]*$/, { name: 'username' }),
    password: Joi.string()
      .trim()
      .min(8)
      .max(50)
      .required(),
    fullName: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .required(),
    picture: Joi.string()
      .uri({ scheme: ['http', 'https'] })
      .trim()
      .max(500)
      .optional(),
    emails: Joi.array()
      .items(
        Joi.object()
          .unknown(false)
          .keys({
            address: Joi.string()
              .trim()
              .email()
              .max(100)
              .required(),
            isVerified: Joi.boolean()
              .default(false)
              .required(),
            isPrimary: Joi.boolean()
              .default(false)
              .required(),
          })
          .required()
      )
      .min(1)
      .max(10)
      .unique((a, b) => a.address === b.address)
      .required(),
  },
});

async function handler({ request, response, db }) {
  const UserModel = db.model('User');

  // ensure there is exactly 1 primary email
  const primaryEmails = request.body.emails.filter((email) => email.isPrimary);
  if (primaryEmails.length < 1) {
    throw new InvalidPrimaryEmailError(
      'You must specify at least 1 primary email'
    );
  }
  if (primaryEmails.length > 1) {
    throw new InvalidPrimaryEmailError(
      'User cannot have more than 1 primary emails'
    );
  }

  // attempt to populate missing picture from gravatar
  let picture = request.body.picture;
  if (!picture) {
    picture = await getGravatarUrl(primaryEmails[0].address);
  }

  // generate salt + digest password
  const salt = await UserModel.generateSalt();
  const iterationCount = 100000; // ~0.3 secs on Macbook Pro Late 2011
  const digestedPassword = await UserModel.digestPassword(
    request.body.password,
    salt,
    iterationCount
  );

  // create user in db
  try {
    const user = await UserModel.create({
      username: request.body.username.toLowerCase(),
      password: digestedPassword,
      salt,
      iterationCount,
      fullName: request.body.fullName,
      picture,
      emails: request.body.emails,
      orgs: [],
      roles: [],
    });

    response.status = 200; // OK
    response.body = {
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        picture: user.picture,
        emails: user.emails,
        orgs: user.orgs,
        roles: user.roles,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  } catch (err) {
    if (err.code === 11000) {
      if (err.message.includes('email_address_uidx')) {
        throw new DuplicateEmailAddressError('Email address already in use');
      }

      if (err.message.includes('username_uidx')) {
        throw new DuplicateUsernameError(
          `Username "${request.body.username}" already in use`
        );
      }
    }

    throw err;
  }
}

export default compose([packJSONRPC, validation, handler]);
