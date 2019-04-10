import { ObjectId } from 'mongodb';

async function deleteUser({ db }, { id }) {
  const UserModel = db.model('User');
  const AuthFactorModel = db.model('AuthFactor');
  const OrgMembershipModel = db.model('OrgMembership');

  // init transaction to delete user + related records in db
  const session = await db.startSession();
  session.startTransaction();

  try {
    // delete user
    const result = await UserModel.deleteOne({
      _id: ObjectId(id),
    });

    // delete auth factors
    await AuthFactorModel.deleteMany({
      user: ObjectId(id),
    });

    // delete org membership(s)
    await OrgMembershipModel.deleteMany({
      userId: ObjectId(id),
    });

    await session.commitTransaction();

    return !!result.ok;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

export default deleteUser;
