import { ObjectId } from 'mongodb';
import { TokenNotFoundError, OrgMembershipAlreadyExists } from '../../../constants/errors';

const joinOrg = async (db, bus, { token: secret, userId }) => {
  const TokenModel = db.model('Token');
  const OrgMembershipModel = db.model('OrgMembership');

  // acquire token from db
  const token = await TokenModel.findOne({
    secret,
    type: 'INVITATION',
  });

  // ensure token exists
  if (!token) {
    throw new TokenNotFoundError('Token does not exist or has already expired');
  }

  // ensure userId matches token.userId
  if (token.userId && !token.userId.equals(userId)) {
    throw new TokenNotFoundError('Token does not exist or has already expired');
  }

  // check if user is already a member of the underlying org
  const existingMembership = await OrgMembershipModel.findOne({
    orgId: ObjectId(token.payload.get('orgId')),
    userId: ObjectId(userId),
  });

  if (existingMembership) {
    throw new OrgMembershipAlreadyExists(
      `User "${userId}" is already a member of org "${token.payload.get('orgId')}"`
    );
  }

  // init transaction to create org membership + redeem token
  const session = await db.startSession();
  session.startTransaction();

  try {
    // create org membership
    await OrgMembershipModel.create({
      orgId: ObjectId(token.payload.get('orgId')),
      userId: ObjectId(userId),
      roles: token.payload.get('roles').map((e) => ({
        id: ObjectId(e.id),
        resourceId: e.resourceId,
      })),
      permissions: token.payload.get('roles').map((e) => ({
        id: ObjectId(e.id),
        resourceId: e.resourceId,
      })),
    });

    // redeem token, i.e. delete from db
    await TokenModel.deleteOne({
      _id: token._id,
    });

    await session.commitTransaction();

    // emit event
    bus.emit('join_user', {
      userId,
      orgId: token.payload.get('orgId'),
    });

    return true;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export default joinOrg;
