import {
  DuplicateEmailAddressError,
  DuplicateUsernameError,
} from '../../../constants/errors';

async function updateUser({ db }, user, nextProps) {
  const UserModel = db.model('User');

  // make sure next username is allowed (Something with isUsernameEnabled)???
  // if (nextProps.username && nextProps.username) {
  //   throw new InvalidPermissionError(
  //     'Usernames are not allowed when isUsernameEnabled is not set to true'
  //   );
  // }

  // update user in db
  try {
    const updatedAt = new Date();
    const newUser = {
      ...user,
      ...nextProps,
      updatedAt,
    };
    await UserModel.updateOne(
      {
        _id: user.id,
      },
      {
        $set: newUser,
      }
    );

    return newUser;
  } catch (err) {
    if (err.code === 11000) {
      if (err.message.includes('email_address_uidx')) {
        throw new DuplicateEmailAddressError('Email address already in use');
      }

      if (err.message.includes('username_uidx')) {
        throw new DuplicateUsernameError(`Username "${nextProps.username}" already in use`);
      }
    }

    throw err;
  }
}

export default updateUser;
