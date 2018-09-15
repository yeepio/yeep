import { getGravatarUrl } from '../../../utils/gravatar';
import {
  InvalidPrimaryEmailError,
  DuplicateEmailAddressError,
  DuplicateUsernameError,
  InvalidUsernameError,
} from '../../../constants/errors';
import commonNames from '../../../utils/commonNames';

async function createUser(db, { username, password, fullName, picture, emails, orgs = [] }) {
  const UserModel = db.model('User');
  const CredentialsModel = db.model('Credentials');

  // ensure there is exactly 1 primary email
  const primaryEmails = emails.filter((email) => email.isPrimary);
  if (primaryEmails.length < 1) {
    throw new InvalidPrimaryEmailError('You must specify at least 1 primary email');
  }
  if (primaryEmails.length > 1) {
    throw new InvalidPrimaryEmailError('User cannot have more than 1 primary emails');
  }

  // attempt to populate missing picture from gravatar
  if (!picture) {
    picture = await getGravatarUrl(primaryEmails[0].address);
  }

  // normalize username
  let normalizedUsername;

  if (username) {
    normalizedUsername = UserModel.normalizeUsername(username);

    // ensure username does not contain common names
    if (commonNames.has(normalizedUsername)) {
      throw new InvalidUsernameError(`Username "${username}" is reserved for system use`);
    }
  }

  // normalize emails
  const normalizedEmails = emails.map((email) => {
    return {
      ...email,
      address: UserModel.normalizeEmailAddress(email.address),
    };
  });

  // generate salt + digest password
  const salt = await CredentialsModel.generateSalt();
  const iterationCount = 100000; // ~0.3 secs on Macbook Pro Late 2011
  const digestedPassword = await CredentialsModel.digestPassword(password, salt, iterationCount);

  // init transaction to create user + related records in db
  const session = await db.startSession();
  session.startTransaction();

  try {
    // create use
    const user = await UserModel.create({
      username: normalizedUsername,
      fullName,
      picture,
      emails: normalizedEmails,
      orgs,
    });

    // create password credentials
    await CredentialsModel.create({
      type: 'PASSWORD',
      user: user._id,
      password: digestedPassword,
      salt,
      iterationCount,
    });

    await session.commitTransaction();

    return {
      id: user.id, // as hex string
      username: user.username,
      fullName: user.fullName,
      picture: user.picture,
      emails: user.emails,
      orgs: user.orgs,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
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

export default createUser;
