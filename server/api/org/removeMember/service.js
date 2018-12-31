import { ObjectId } from 'mongodb';
import {
  UserNotFoundError,
  OrgNotFoundError,
  OrgMembershipNotFoundError,
} from '../../../constants/errors';

const removeMemberFromOrg = async (db, { orgId, userId }) => {
  const OrgModel = db.model('Org');
  const UserModel = db.model('User');
  const OrgMembershipModel = db.model('OrgMembership');

  // acquire org from db
  const org = await OrgModel.findOne({
    _id: ObjectId(orgId),
  });

  // ensure org exists
  if (!org) {
    throw new OrgNotFoundError(`Org "${orgId}" does not exist`);
  }

  // acquire user from db
  const user = await UserModel.findOne({
    _id: ObjectId(userId),
  });

  // ensure user exists
  if (!user) {
    throw new UserNotFoundError(`User "${userId}" does not exist`);
  }

  // acquire org membership from db
  const orgMembership = await OrgMembershipModel.findOne({
    orgId: org._id,
    userId: user._id,
  });

  // ensure org membership exists
  if (!orgMembership) {
    throw new OrgMembershipNotFoundError(`User "${userId}" is not a member of org "${orgId}"`);
  }

  // delete org membership
  const result = await OrgMembershipModel.deleteOne({
    userId: user._id,
    orgId: org._id,
  });

  return !!result.ok;
};

export default removeMemberFromOrg;
