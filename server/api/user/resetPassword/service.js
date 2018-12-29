import isBefore from 'date-fns/is_before';
import {
  UserNotFoundError,
  UserDeactivatedError,
  TokenNotFoundError,
} from '../../../constants/errors';

async function resetPassword(db, bus, { token: secret, password }) {
  const TokenModel = db.model('Token');
  const UserModel = db.model('User');
  const CredentialsModel = db.model('Credentials');

  // acquire token from db
  const token = await TokenModel.findOne({
    secret,
    type: 'PASSWORD_RESET',
  });

  // ensure token exists
  if (!token) {
    throw new TokenNotFoundError('Token does not exist or has already expired');
  }

  // acquire user from db
  const user = await UserModel.findOne({ _id: token.userId });

  // ensure user exists
  if (!user) {
    throw new UserNotFoundError('User does not exist');
  }

  // ensure user is active
  if (!!user.deactivatedAt && isBefore(user.deactivatedAt, new Date())) {
    throw new UserDeactivatedError(`User ${token.userId.toHexString()} is deactivated`);
  }

  // generate salt + digest password
  const salt = await CredentialsModel.generateSalt();
  const iterationCount = 100000; // ~0.3 secs on Macbook Pro Late 2011
  const digestedPassword = await CredentialsModel.digestPassword(password, salt, iterationCount);
  const currentDate = new Date();

  // init transaction to update password in db
  const session = await db.startSession();
  session.startTransaction();

  try {
    // update password credentials
    await CredentialsModel.updateOne(
      {
        user: token.userId,
        type: 'PASSWORD',
      },
      {
        $set: {
          password: digestedPassword,
          salt,
          iterationCount,
          updatedAt: currentDate,
        },
      }
    );

    // redeem token, i.e. delete from db
    await TokenModel.deleteOne({
      _id: token._id,
    });

    await session.commitTransaction();

    // emit event
    bus.emit('password_reset_success', {
      user: {
        id: user._id.toHexString(),
        fullName: user.fullName,
        picture: user.picture,
        emailAddress: user.findPrimaryEmail(),
      },
    });

    return {
      id: user._id.toHexString(),
      updatedAt: currentDate,
    };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

export default resetPassword;
