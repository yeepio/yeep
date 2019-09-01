import { ObjectId } from 'mongodb';

export async function deleteOrg({ db }, { id }) {
  const OrgModel = db.model('Org');
  const OrgMembershipModel = db.model('OrgMembership');

  const session = await db.startSession();
  session.startTransaction();

  try {
    await OrgMembershipModel.deleteMany({
      orgId: ObjectId(id),
    });
    const result = await OrgModel.deleteOne({ _id: id });
    await session.commitTransaction();
    return !!result.ok;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

export default deleteOrg;
