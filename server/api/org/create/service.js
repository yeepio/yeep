import memoize from 'lodash/memoize';
import { DuplicateOrgError } from '../../../constants/errors';

const getAdminPermissions = memoize((db) => {
  const PermissionModel = db.model('Permission');
  return PermissionModel.find({
    name: { $in: ['yeep.org.write', 'yeep.org.read'] },
  });
}, () => 'permissions');

async function createOrg(db, { name, slug, adminId }) {
  const OrgModel = db.model('Org');
  const UserModel = db.model('User');
  const PermissionAssignmentModel = db.model('PermissionAssignment');

  const session = await db.startSession();
  session.startTransaction();

  try {
    // create org
    const org = await OrgModel.create({ name, slug });

    // push org ID to user orgs array
    await UserModel.updateOne({ _id: adminId }, { $push: { orgs: org._id } });

    // retrieve admin permissions
    const permissions = await getAdminPermissions(db);

    // assign admin permissions
    await PermissionAssignmentModel.create(
      permissions.map((permission) => {
        return {
          user: adminId,
          org: org.id,
          permission: permission.id,
        };
      })
    );

    await session.commitTransaction();
    return {
      id: org.id, // as hex string
      name: org.name,
      slug: org.slug,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    };
  } catch (err) {
    if (err.code === 11000) {
      throw new DuplicateOrgError(`Org "${slug}" already exists`);
    }

    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

export default createOrg;
