import { ObjectId } from 'mongodb';
import { UserNotFoundError } from '../../../constants/errors';

async function activateUser(db, { id }) {
  const UserModel = db.model('User');
  const currentDate = new Date();

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
        deactivatedAt: null,
        updatedAt: currentDate,
      },
    }
  );

  return {
    id: user._id.toHexString(),
    deactivatedAt: null,
    updatedAt: currentDate,
  };
}

export default activateUser;
