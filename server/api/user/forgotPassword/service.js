import addSeconds from 'date-fns/add_seconds';
import isBefore from 'date-fns/is_before';
import { UserNotFoundError, UserDeactivatedError } from '../../../constants/errors';
import { PASSWORD_RESET } from '../../../constants/tokenTypes';

async function initPasswordReset({ db, bus }, { username, emailAddress, tokenExpiresInSeconds }) {
  const UserModel = db.model('User');
  const TokenModel = db.model('Token');

  // acquire user from db
  const user = await UserModel.findOne(
    username
      ? { username }
      : {
          emails: { $elemMatch: { address: emailAddress } },
        }
  );

  // ensure user exists
  if (!user) {
    throw new UserNotFoundError('User does not exist');
  }

  // ensure user is active
  if (!!user.deactivatedAt && isBefore(user.deactivatedAt, new Date())) {
    throw new UserDeactivatedError(`User "${username || emailAddress}" is deactivated`);
  }

  // create password-reset token
  const tokenRecord = await TokenModel.create({
    secret: TokenModel.generateSecret({ length: 24 }),
    type: PASSWORD_RESET,
    payload: {},
    user: user._id,
    expiresAt: addSeconds(new Date(), tokenExpiresInSeconds), // i.e. in 1 hour
  });

  // emit event
  bus.emit('password_reset_init', {
    user: {
      id: user._id.toHexString(),
      fullName: user.fullName,
      picture: user.picture,
      emailAddress: emailAddress || user.findPrimaryEmail(),
    },
    token: {
      id: tokenRecord._id.toHexString(),
      secret: tokenRecord.secret,
      type: tokenRecord.type,
      createdAt: tokenRecord.createdAt,
      expiresAt: tokenRecord.expiresAt,
    },
  });

  return true;
}

export default initPasswordReset;
