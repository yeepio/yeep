import addSeconds from 'date-fns/add_seconds';
import isBefore from 'date-fns/is_before';
import { UserNotFoundError, UserDeactivatedError } from '../../../constants/errors';

async function initPasswordReset(db, bus, { username, emailAddress, tokenExpiresInSeconds }) {
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
  const token = await TokenModel.create({
    secret: TokenModel.generateSecret({ length: 24 }),
    type: 'PASSWORD_RESET',
    payload: {},
    userId: user._id,
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
      id: token._id.toHexString(),
      secret: token.secret,
      type: token.type,
      createdAt: token.createdAt,
      expiresAt: token.expiresAt,
    },
  });

  return true;
}

export default initPasswordReset;
