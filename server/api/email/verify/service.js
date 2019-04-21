import { ObjectId } from 'mongodb';
import isBefore from 'date-fns/is_before';
import {
  UserNotFoundError,
  UserDeactivatedError,
  TokenNotFoundError,
} from '../../../constants/errors';

async function verify(ctx, { token: secret }) {
  const { db, bus } = ctx;
  const TokenModel = db.model('Token');
  const UserModel = db.model('User');

  // acquire token from db
  const tokenRecord = await TokenModel.findOne({
    secret,
    type: 'EMAIL_VERIFICATION',
  });

  // ensure token exists
  if (!tokenRecord) {
    throw new TokenNotFoundError('Token does not exist or has already expired');
  }

  // acquire user from db
  const user = await UserModel.findOne({ _id: tokenRecord.userId });

  // ensure user exists
  if (!user) {
    throw new UserNotFoundError('User does not exist');
  }

  // ensure user is active
  if (!!user.deactivatedAt && isBefore(user.deactivatedAt, new Date())) {
    throw new UserDeactivatedError(`User ${tokenRecord.userId.toHexString()} is deactivated`);
  }

  const nextEmails = user.emails.map((email) => {
    if (email.address === tokenRecord.payload.get('emailAddress')) {
      email.isVerified = true;
    }

    return email;
  });

  const currentDate = new Date();

  // init transaction to update emails in db
  const session = await db.startSession();
  session.startTransaction();
  try {
    // update user in db
    await UserModel.updateOne(
      {
        _id: ObjectId(user.id),
      },
      {
        $set: {
          emails: nextEmails,
          updatedAt: currentDate,
        },
      }
    );
    // redeem token, i.e. delete from db
    await TokenModel.deleteOne({
      _id: tokenRecord._id,
    });

    await session.commitTransaction();

    // emit event
    bus.emit('email_verification_success', {
      user: {
        id: user._id.toHexString(),
        fullName: user.fullName,
        picture: user.picture,
        emailAddress: tokenRecord.payload.get('emailAddress'),
      },
    });

    return {
      id: user._id.toHexString(),
      username: user.username,
      fullName: user.fullName,
      picture: user.picture,
      emails: nextEmails,
      updatedAt: currentDate,
    };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

export default verify;
