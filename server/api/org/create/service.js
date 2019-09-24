import { ObjectId } from 'mongodb';
import memoize from 'lodash/memoize';
import { DuplicateOrgError } from '../../../constants/errors';

const getAdminRole = memoize(
  function({ db }) {
    const RoleModel = db.model('Role');
    return RoleModel.findOne(
      {
        name: 'admin',
      },
      {
        _id: 1,
      }
    );
  },
  () => 'role'
);

async function createOrg(ctx, { name, slug, adminId }) {
  const adminRole = await getAdminRole(ctx);

  const { db } = ctx;
  const OrgModel = db.model('Org');
  const OrgMembershipModel = db.model('OrgMembership');

  const session = await db.startSession();
  session.startTransaction();

  try {
    // create org
    const [org] = await OrgModel.create([{ name, slug }], { session });

    if (adminId) {
      // create org membership
      await OrgMembershipModel.create(
        [
          {
            userId: ObjectId(adminId),
            orgId: org._id,
            roles: [
              {
                id: adminRole._id,
              },
            ],
          },
        ],
        { session }
      );
    }

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
