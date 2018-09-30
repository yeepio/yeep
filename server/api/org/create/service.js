import { ObjectId } from 'mongodb';
import memoize from 'lodash/memoize';
import { DuplicateOrgError } from '../../../constants/errors';

const getAdminRole = memoize((db) => {
  const RoleModel = db.model('Role');
  return RoleModel.findOne(
    {
      name: 'admin',
    },
    {
      _id: 1,
    }
  );
}, () => 'role');

async function createOrg(db, { name, slug, adminId }) {
  const OrgModel = db.model('Org');
  const OrgMembershipModel = db.model('OrgMembership');

  // retrieve admin role
  const adminRole = await getAdminRole(db);

  const session = await db.startSession();
  session.startTransaction();

  try {
    // create org
    const org = await OrgModel.create({ name, slug });

    // create org membership
    await OrgMembershipModel.create({
      userId: ObjectId(adminId),
      orgId: org._id,
      roles: [
        {
          id: adminRole._id,
        },
      ],
    });

    await session.commitTransaction();

    return {
      id: org._id.toHexString(),
      name: org.name,
      slug: org.slug,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    };
  } catch (err) {
    await session.abortTransaction();

    if (err.code === 11000) {
      throw new DuplicateOrgError(`Org "${slug}" already exists`);
    }
    throw err;
  } finally {
    session.endSession();
  }
}

export default createOrg;
