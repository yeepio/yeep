import { ObjectId } from 'mongodb';
import addSeconds from 'date-fns/add_seconds';
import { UserNotFoundError } from '../../../constants/errors';

async function deactivateUser({ db }, { id, deactivateAfterSeconds = 0 }) {
  const UserModel = db.model('User');
  const currentDate = new Date();
  const deactivatedAt = addSeconds(currentDate, deactivateAfterSeconds);

  // ensure user exists
  const user = await UserModel.findOne({ _id: ObjectId(id) });

  if (!user) {
    throw new UserNotFoundError('User does not exist');
  }

  // update user
  await UserModel.updateOne(
    {
      _id: user._id,
    },
    {
      $set: {
        deactivatedAt,
        updatedAt: currentDate,
      },
    }
  );

  return {
    id: user._id.toHexString(),
    deactivatedAt,
    updatedAt: currentDate,
  };
}

export default deactivateUser;
