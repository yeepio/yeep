import { DuplicateOrgError } from '../../../constants/errors';

async function createOrg(db, { name, slug, adminId }) {
  const OrgModel = db.model('Org');
  const UserModel = db.model('User');

  try {
    // create org
    const org = await OrgModel.create({ name, slug });

    // push org ID to user orgs array
    await UserModel.updateOne({ _id: adminId }, { $push: { orgs: org._id } });

    // TODO: assign "admin" role to admin

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

    throw err;
  }
}

export default createOrg;
