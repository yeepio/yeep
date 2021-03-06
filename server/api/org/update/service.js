import { ObjectId } from 'mongodb';
import { DuplicateOrgError } from '../../../constants/errors';

export async function updateOrg({ db }, orgId, nextProps) {
  const OrgModel = db.model('Org');

  // update org in db
  try {
    const updatedAt = new Date();
    await OrgModel.updateOne(
      {
        _id: ObjectId(orgId),
      },
      {
        $set: {
          ...nextProps,
          updatedAt,
        },
      }
    );

    return {
      id: orgId,
      ...nextProps,
      updatedAt,
    };
  } catch (err) {
    if (err.code === 11000) {
      throw new DuplicateOrgError(`Org "${orgId}" already exists`);
    }

    throw err;
  }
}
