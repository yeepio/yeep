import { DuplicateOrgError } from '../../../constants/errors';

async function createOrg(db, { name, slug }) {
  const OrgModel = db.model('Org');

  try {
    const org = await OrgModel.create({ name, slug });

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
