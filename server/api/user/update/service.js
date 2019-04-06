import has from 'lodash/has';
import isEmpty from 'lodash/isEmpty';
import {
  InvalidPrimaryEmailError,
  DuplicateEmailAddressError,
  DuplicateUsernameError,
  InvalidUsernameError,
} from '../../../constants/errors';
import deleteUserPicture from '../deletePicture/service';
import commonNames from '../../../utils/commonNames';

async function updateUser({ db, storage }, user, nextProps) {
  const UserModel = db.model('User');
  const CredentialsModel = db.model('Credentials');

  const nextUser = {};
  const nextCredentials = {};

  // decorate nextUser obj with emails
  if (nextProps.emails) {
    // ensure there is exactly 1 primary email
    const primaryEmails = nextProps.emails.filter((email) => email.isPrimary);
    if (primaryEmails.length < 1) {
      throw new InvalidPrimaryEmailError('You must specify at least 1 primary email');
    }
    if (primaryEmails.length > 1) {
      throw new InvalidPrimaryEmailError('User cannot have more than 1 primary emails');
    }

    // if requestor changes the previous primary email it also needs to be verified
    const primaryEmail = primaryEmails[0];
    const emailExisted = user.emails.find((email) => primaryEmail.address === email.address);
    if (!emailExisted || !emailExisted.isVerified) {
      throw new InvalidPrimaryEmailError(
        `You need to verify ${primaryEmail.address} before marking it as primary`
      );
    }

    // normalize emails
    const normalizedEmails = nextProps.emails.map((email) => {
      return {
        ...email,
        address: UserModel.normalizeEmailAddress(email.address),
      };
    });

    nextUser.emails = normalizedEmails;
  }

  // decorate nextUser obj with username
  if (nextProps.username) {
    const normalizedUsername = UserModel.normalizeUsername(nextProps.username);

    // ensure username does not contain common names
    if (commonNames.has(normalizedUsername)) {
      throw new InvalidUsernameError(`Username "${nextProps.username}" is reserved for system use`);
    }

    nextUser.username = normalizedUsername;
  }

  // decorate nextUser obj with picture
  if (has(nextProps, 'picture') && nextProps.picture !== user.picture) {
    nextUser.picture = nextProps.picture;
  }

  // decorate nextUser obj with fullName
  if (has(nextProps, 'fullName') && nextProps.fullName !== user.fullName) {
    nextUser.fullName = nextProps.fullName;
  }

  // decorate nextCredentials obj
  if (nextProps.password) {
    nextCredentials.salt = await CredentialsModel.generateSalt();
    nextCredentials.iterationCount = 100000; // ~0.3 secs on Macbook Pro Late 2011
    nextCredentials.password = await CredentialsModel.digestPassword(
      nextProps.password,
      nextCredentials.salt,
      nextCredentials.iterationCount
    );
  }

  // init transaction to update user + related records in db
  const session = await db.startSession();
  session.startTransaction();

  try {
    const now = Date.now(); // get current timestamp

    if (!isEmpty(nextCredentials)) {
      nextCredentials.updatedAt = now;

      await CredentialsModel.updateOne(
        {
          user: user.id,
          type: 'PASSWORD',
        },
        {
          $set: nextCredentials,
        }
      );
    }

    if (!isEmpty(nextUser)) {
      nextUser.updatedAt = now;

      await UserModel.updateOne(
        {
          _id: user.id,
        },
        {
          $set: nextUser,
        }
      );
    }

    await session.commitTransaction();

    if (has(nextUser, 'picture')) {
      await deleteUserPicture({ db, storage }, user);
    }

    return {
      ...user,
      ...nextUser,
    };
  } catch (err) {
    await session.abortTransaction();
    if (err.code === 11000) {
      if (err.message.includes('email_address_uidx')) {
        throw new DuplicateEmailAddressError('Email address already in use');
      }

      if (err.message.includes('username_uidx')) {
        throw new DuplicateUsernameError(`Username "${nextProps.username}" already in use`);
      }
    }

    throw err;
  } finally {
    session.endSession();
  }
}

export default updateUser;
