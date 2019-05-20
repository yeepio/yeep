import faker from 'faker';
export const generateFakeUser = () => ({
  username: faker.internet.userName(),
  password: faker.internet.password(),
  fullName: faker.name.findName(),
  picture: faker.image.avatar(),
  emails: [{
    isPrimary: true,
    isVerified: true,
    address: faker.internet.email(),
  }]
});