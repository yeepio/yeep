import faker from 'faker';
export const generateFakeOrg = () => {

  const name = faker.company.companyName();
  return {
    name,
    slug: faker.helpers.slugify(name),
  };
};