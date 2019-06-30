import { ObjectId } from 'mongodb';
import has from 'lodash/has';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import {
  InvalidPrimaryEmailError,
  DuplicateEmailAddressError,
  DuplicateUsernameError,
  InvalidUsernameError,
  UserNotFoundError,
  AuthFactorRequired,
} from '../../../constants/errors';
import deleteUserPicture from '../deletePicture/service';
import commonNames from '../../../utils/commonNames';
import { verifyAuthFactor } from '../../session/issueToken/service';

export async function updateUser(
  ctx,
  { id, username, password, fullName, picture, emails, secondaryAuthFactor, isMFARequired = true }
) {
  const { db } = ctx;
  const UserModel = db.model('User');
  const PasswordModel = db.model('Password');

  // retrieve user from db
  const user = await UserModel.findOneWithAuthFactors({ _id: ObjectId(id) });

  // make sure user exists
  if (!user) {
    throw new UserNotFoundError(`User ${id} not found`);
  }

  const nextPassword = {};
  const nextUser = {};

  // decorate nextPassword obj
  if (password) {
    // ensure secondary auth factor has been specified
    if (isMFARequired) {
      if (!secondaryAuthFactor) {
        const availableAuthFactors = Array.from(
          user.authFactors.reduce((accumulator, authFactor) => {
            accumulator.add(authFactor.type);
            return accumulator;
          }, new Set())
        );

        throw new AuthFactorRequired(
          `User ${id} has enabled MFA; please specify secondary authentication factor`,
          availableAuthFactors
        );
      }

      // verify secondary auth factor - throws error if unsuccessful
      await verifyAuthFactor(ctx, {
        ...secondaryAuthFactor,
        user,
      });
    }

    nextPassword.salt = await PasswordModel.generateSalt();
    nextPassword.iterationCount = 100000; // ~0.3 secs on Macbook Pro Late 2011
    nextPassword.password = await PasswordModel.digestPassword(
      password,
      nextPassword.salt,
      nextPassword.iterationCount
    );
  }

  // decorate nextUser obj with emails
  if (emails) {
    // ensure there is exactly 1 primary email
    const primaryEmails = emails.filter((email) => email.isPrimary);
    if (primaryEmails.length < 1) {
      throw new InvalidPrimaryEmailError('You must specify at least 1 primary email');
    }
    if (primaryEmails.length > 1) {
      throw new InvalidPrimaryEmailError('User cannot have more than 1 primary emails');
    }

    // if requestor changes the previous primary email it also needs to be verified
    const primaryEmail = primaryEmails[0];
    const prevEmail = user.emails.find((email) => primaryEmail.address === email.address);
    if ((!prevEmail || !prevEmail.isVerified) && !primaryEmail.isVerified) {
      throw new InvalidPrimaryEmailError(
        `You need to verify ${primaryEmail.address} before marking it as primary`
      );
    }

    // normalize emails
    const normalizedEmails = emails.map((email) => {
      const existingEmail = user.emails.find((oldEmail) => oldEmail.address === email.address);
      return {
        ...email,
        address: UserModel.normalizeEmailAddress(email.address),
        isVerified: email.isVerified || get(existingEmail, 'isVerified') || false,
      };
    });

    nextUser.emails = normalizedEmails;
  }

  // decorate nextUser obj with username
  if (username) {
    const normalizedUsername = UserModel.normalizeUsername(username);

    // ensure username does not contain common names
    if (commonNames.has(normalizedUsername)) {
      throw new InvalidUsernameError(`Username "${username}" is reserved for system use`);
    }

    nextUser.username = normalizedUsername;
  }

  // decorate nextUser obj with picture
  if (picture !== undefined && picture !== user.picture) {
    nextUser.picture = picture;
  }

  // decorate nextUser obj with fullName
  if (fullName && fullName !== user.fullName) {
    nextUser.fullName = fullName;
  }

  // init transaction to update user + related records in db
  const session = await db.startSession();
  session.startTransaction();

  try {
    const now = Date.now(); // get current timestamp

    if (!isEmpty(nextPassword)) {
      nextPassword.updatedAt = now;

      await PasswordModel.updateOne(
        {
          user: user._id,
        },
        {
          $set: nextPassword,
        }
      );
    }

    if (!isEmpty(nextUser)) {
      nextUser.updatedAt = now;

      await UserModel.updateOne(
        {
          _id: user._id,
        },
        {
          $set: nextUser,
        }
      );
    }

    if (has(nextUser, 'picture')) {
      await deleteUserPicture(ctx, { id });
    }

    await session.commitTransaction();

    return {
      id: user._id.toHexString(),
      picture: nextUser.picture === undefined ? user.picture : nextUser.picture,
      username: nextUser.username || user.username,
      fullName: nextUser.fullName || user.fullName,
      emails: nextUser.emails || user.emails,
    };
  } catch (err) {
    await session.abortTransaction();
    if (err.code === 11000) {
      if (err.message.includes('email_address_uidx')) {
        throw new DuplicateEmailAddressError('Email address already in use');
      }

      if (err.message.includes('username_uidx')) {
        throw new DuplicateUsernameError(`Username "${username}" already in use`);
      }
    }

    throw err;
  } finally {
    session.endSession();
  }
}
