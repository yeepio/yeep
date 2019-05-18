import { ObjectId } from 'mongodb';
import addSeconds from 'date-fns/add_seconds';
import isBefore from 'date-fns/is_before';
import {
  EmailNotFoundError,
  EmailAlreadyVerifiedError,
  UserDeactivatedError,
} from '../../../constants/errors';

async function initEmailVerification(ctx, user, nextProps) {
  const { db, bus } = ctx;
  const { tokenExpiresInSeconds, emailAddress } = nextProps;
  const TokenModel = db.model('Token');

  const emailExists = user.emails.find((email) => emailAddress === email.address);
  if (!emailExists) {
    throw new EmailNotFoundError(`User ${user.id} does not have an email address ${emailAddress}`);
  }
  if (emailExists.isVerified) {
    throw new EmailAlreadyVerifiedError(
      `Email address ${emailAddress} is already verified for user ${user.id}`
    );
  }

  if (!!user.deactivatedAt && isBefore(user.deactivatedAt, new Date())) {
   throw new UserDeactivatedError(`User ${tokenRecord.userId.toHexString()} is deactivated`);
  }
  // create email verification token
  const secret = TokenModel.generateSecret({ length: 24 });
  const tokenRecord = await TokenModel.create({
    secret,
    type: 'EMAIL_VERIFICATION',
    payload: {
      emailAddress,
    },
    user: ObjectId(user.id),
    expiresAt: addSeconds(new Date(), tokenExpiresInSeconds), // i.e. in 1 hour
  });

  // emit event
  bus.emit('email_verification_init', {
    user: {
      id: user.id,
      fullName: user.fullName,
      picture: user.picture,
      emailAddress,
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

export default initEmailVerification;
