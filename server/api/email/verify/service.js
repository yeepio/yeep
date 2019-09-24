import { ObjectId } from 'mongodb';
import {
  UserNotFoundError,
  TokenNotFoundError,
  EmailNotFoundError,
} from '../../../constants/errors';

async function verify(ctx, { token: secret }) {
  const { db, bus } = ctx;
  const EmailVerificationTokenModel = db.model('EmailVerificationToken');
  const UserModel = db.model('User');

  // acquire token from db
  const tokenRecord = await EmailVerificationTokenModel.findOne({ secret });

  // ensure token exists
  if (!tokenRecord) {
    throw new TokenNotFoundError('Token does not exist or has already expired');
  }

  // acquire user from db
  const user = await UserModel.findOne({ _id: tokenRecord.user });

  // ensure user exists
  if (!user) {
    throw new UserNotFoundError('User does not exist');
  }

  let didUpdateField = false;
  const emailToVerify = tokenRecord.emailAddress;
  const nextEmails = user.emails.map((email) => {
    if (email.address === emailToVerify) {
      email.isVerified = true;
      didUpdateField = true;
    }

    return email;
  });

  // early return in case an email was not found
  if (!didUpdateField) {
    throw new EmailNotFoundError(`User ${user.id} does not have an email address ${emailToVerify}`);
  }

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
      },
      { session }
    );
    // redeem token, i.e. delete from db
    await EmailVerificationTokenModel.deleteOne(
      {
        _id: tokenRecord._id,
      },
      { session }
    );

    await session.commitTransaction();

    // emit event
    bus.emit('email_verification_success', {
      user: {
        id: user._id.toHexString(),
        fullName: user.fullName,
        picture: user.picture,
        emailAddress: emailToVerify,
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
