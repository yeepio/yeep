import { ObjectId } from 'mongodb';
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

  const updatedUser = { ...nextProps };
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
      throw new InvalidPrimaryEmailError(`You need to verify ${primaryEmail.address} before marking it as primary`); 
    }


    // normalize emails
    const normalizedEmails = nextProps.emails.map((email) => {
      return {
        ...email,
        address: UserModel.normalizeEmailAddress(email.address),
      };
    });

    updatedUser.emails = normalizedEmails;
  }

  if (nextProps.username) {
    const normalizedUsername = UserModel.normalizeUsername(nextProps.username);

    // ensure username does not contain common names
    if (commonNames.has(normalizedUsername)) {
      throw new InvalidUsernameError(`Username "${nextProps.username}" is reserved for system use`);
    }

    updatedUser.username = normalizedUsername;
  }

  let salt, iterationCount, password;
  if (nextProps.password) {
    salt = await CredentialsModel.generateSalt();
    iterationCount = 100000; // ~0.3 secs on Macbook Pro Late 2011
    password = await CredentialsModel.digestPassword(nextProps.password, salt, iterationCount);
  }

  // remove previous picture if property provided
  if (nextProps.picture || nextProps.picture === null) {
    await deleteUserPicture({ db, storage }, user);
  }

  // init transaction to update user + related records in db
  const session = await db.startSession();
  session.startTransaction();

  try {

    updatedUser.updatedAt = new Date();
    if (nextProps.password) {
      // update password credentials
      await CredentialsModel.updateOne(
        {
          user: user.id,
          type: 'PASSWORD',
        },
        {
          $set: {
            password: password,
            salt,
            iterationCount,
            updatedAt: updatedUser.updatedAt,
          },
        }
      );
    }

    await UserModel.updateOne(
      {
        _id: user.id,
      },
      {
        $set: updatedUser,
      }
    );

    await session.commitTransaction();

    return {
      ...user,
      ...updatedUser,
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
