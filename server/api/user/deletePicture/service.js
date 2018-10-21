import { ObjectId } from 'mongodb';
import { UserNotFoundError } from '../../../constants/errors';

async function deleteUserPicture(db, storage, { id }) {
  const UserModel = db.model('User');
  const currentDate = new Date();

  // acquire user from db
  const user = await UserModel.findOne({
    _id: ObjectId(id),
  });

  // ensure user exists
  if (!user) {
    throw new UserNotFoundError('User does not exist');
  }

  // ensure user has picture
  if (!user.picture) {
    // return user with last known updatedAt date
    return {
      id,
      picture: null,
      updatedAt: user.updatedAt,
    };
  }

  // resolve URL to filename
  let filename;
  try {
    filename = storage.relative(user.picture);
  } catch (err) {
    if (err.code === 'ERR_INVALID_URL') {
      // this must be a gravatar or external URL, so do nothing
    } else {
      throw err;
    }
  }

  // delete picture from storage layer
  if (filename) {
    await storage.removeFile(filename);
  }

  // update user in db
  await UserModel.updateOne(
    {
      _id: ObjectId(id),
    },
    {
      $set: {
        picture: null,
        updatedAt: currentDate,
      },
    }
  );

  return {
    id,
    picture: null,
    updatedAt: currentDate,
  };
}

export default deleteUserPicture;
