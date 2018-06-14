import { getGravatarUrl } from '../../../utils/gravatar';
import {
  InvalidPrimaryEmailError,
  DuplicateEmailAddressError,
  DuplicateUsernameError,
} from '../../../constants/errors';

async function createUser(
  db,
  { username, password, fullName, picture, emails }
) {
  const UserModel = db.model('User');

  // ensure there is exactly 1 primary email
  const primaryEmails = emails.filter((email) => email.isPrimary);
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
  if (!picture) {
    picture = await getGravatarUrl(primaryEmails[0].address);
  }

  // generate salt + digest password
  const salt = await UserModel.generateSalt();
  const iterationCount = 100000; // ~0.3 secs on Macbook Pro Late 2011
  const digestedPassword = await UserModel.digestPassword(
    password,
    salt,
    iterationCount
  );

  // create user in db
  try {
    const user = await UserModel.create({
      username: username.toLowerCase(),
      password: digestedPassword,
      salt,
      iterationCount,
      fullName: fullName,
      picture,
      emails: emails,
      orgs: [],
    });

    return {
      id: user._id,
      username: user.username,
      fullName: user.fullName,
      picture: user.picture,
      emails: user.emails,
      orgs: user.orgs,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch (err) {
    if (err.code === 11000) {
      if (err.message.includes('email_address_uidx')) {
        throw new DuplicateEmailAddressError('Email address already in use');
      }

      if (err.message.includes('username_uidx')) {
        throw new DuplicateUsernameError(
          `Username "${username}" already in use`
        );
      }
    }

    throw err;
  }
}

export default createUser;
