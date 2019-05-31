import faker from 'faker';

export const generateFakeUser = () => {

  const emailAddress = faker.internet.email();
  const username = emailAddress.match(/^([^@]*)@/)[1];
  return {
    username: username.toLowerCase(),
    password: faker.internet.password(),
    fullName: faker.name.findName(),
    picture: faker.image.avatar(),
    emails: [{
      isPrimary: true,
      isVerified: true,
      address: emailAddress,
    }],
  }
};