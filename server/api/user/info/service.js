import { UserNotFoundError } from '../../../constants/errors';

async function getUserInfo(db, { id }) {
  const UserModel = db.model('User');

  // ensure user exists
  const user = await UserModel.findOne({ _id: id });

  if (!user) {
    throw new UserNotFoundError('User does not exist');
  }

  return {
    id: user.id, // as hex string
    username: user.username,
    fullName: user.fullName,
    picture: user.picture,
    emails: user.emails,
    orgs: user.orgs.map((oid) => oid.toHexString()),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export default getUserInfo;
