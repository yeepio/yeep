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
  const UserModel = db.model('User');
  const RoleAssignmentModel = db.model('RoleAssignment');

  const session = await db.startSession();
  session.startTransaction();

  try {
    // create org
    const org = await OrgModel.create({ name, slug });

    // push org ID to user orgs array
    await UserModel.updateOne({ _id: adminId }, { $push: { orgs: org._id } });

    // retrieve admin role
    const role = await getAdminRole(db);

    // assign admin permissions
    await RoleAssignmentModel.create({
      user: adminId,
      org: org.id,
      role: role._id.toHexString(),
    });

    await session.commitTransaction();

    return {
      id: org.id, // as hex string
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
