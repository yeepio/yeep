// import faker from 'faker';
// import mongoose from 'mongoose';
// import { ObjectId } from 'mongodb';


// export const createFakeUsers = async (db, numberOfUsers) => {
//   const users = [];
//   const usersArray = Array.from(Array(numberOfUsers));
//   const promises = usersArray.map(async (id, idx) => { 
//     const user = await generateFakeUser({ db });
//     console.log(`Created user with id: ${user.id}`);
//     users.push(user.id)
//   });

//   await Promise.all(promises);
//   return users;
// }

// export const deleteAllUsers = async (db, usersArray) => {
//   const promises = usersArray.map(async (id, idx) => 
//     console.log(`Deleting user ${id}:`, await deleteFakeUser({ db }, { id }))
//   );

//   await Promise.all(promises);
// }

// export const generateFakeUser = async ({ db }) => {
//   const user = {
//     username: faker.internet.userName(),
//     password: faker.internet.password(),
//     fullName: faker.name.findName(),
//     picture: faker.image.avatar(),
//     emails: [{
//       isPrimary: true,
//       isVerified: true,
//       address: faker.internet.email(),
//     }]
//   };

//   return await generateUser({ db }, user);
// };

// export const deleteFakeUser = async ({ db }, { id }) => {
//   const UserModel = db.model('User');
//   const AuthFactorModel = db.model('AuthFactor');
//   const OrgMembershipModel = db.model('OrgMembership');

//   // init transaction to delete user + related records in db
//   const session = await db.startSession();
//   session.startTransaction();

//   try {
//     // delete user
//     const result = await UserModel.deleteOne({
//       _id: ObjectId(id),
//     });

//     // delete auth factors
//     await AuthFactorModel.deleteMany({
//       user: ObjectId(id),
//     });

//     // delete org membership(s)
//     await OrgMembershipModel.deleteMany({
//       userId: ObjectId(id),
//     });

//     await session.commitTransaction();

//     return !!result.ok;
//   } catch (err) {
//     await session.abortTransaction();
//     throw err;
//   } finally {
//     session.endSession();
//   }
// };

// const generateUser = async ({ db }, { username, password, fullName, picture, emails, orgs = [] }) => {
//   const UserModel = db.model('User');
//   const PasswordModel = db.model('Password');
//   const OrgMembershipModel = db.model('OrgMembership');

//   // ensure there is exactly 1 primary email
//   const primaryEmails = emails.filter((email) => email.isPrimary);

//   // normalize username
//   let normalizedUsername;

//   if (username) {
//     normalizedUsername = UserModel.normalizeUsername(username);
//   }

//   // generate salt + digest password
//   const salt = await PasswordModel.generateSalt();
//   const iterationCount = 100000; // ~0.3 secs on Macbook Pro Late 2011
//   const digestedPassword = await PasswordModel.digestPassword(password, salt, iterationCount);

//   // init transaction to create user + related records in db
//   const session = await db.startSession();
//   session.startTransaction();

//   try {
//     // create user
//     const user = await UserModel.create({
//       username: normalizedUsername,
//       fullName,
//       picture,
//       emails,
//     });

//     // create password auth factor
//     await PasswordModel.create({
//       user: user._id,
//       password: digestedPassword,
//       salt,
//       iterationCount,
//     });

//     // create org membership(s)
//     await OrgMembershipModel.insertMany([
//       {
//         orgId: null,
//         userId: user._id,
//       },
//       ...orgs.map((org) => ({
//         orgId: ObjectId(org),
//         userId: user._id,
//       })),
//     ]);

//     await session.commitTransaction();
//     return {
//       id: user._id.toHexString(),
//       username: user.username,
//       fullName: user.fullName,
//       picture: user.picture,
//       emails: user.emails,
//       orgs,
//       createdAt: user.createdAt,
//       updatedAt: user.updatedAt,
//     };
//   } catch (err) {
//     await session.abortTransaction();

//     if (err.code === 11000) {
//       if (err.message.includes('email_address_uidx')) {
//         throw new DuplicateEmailAddressError('Email address already in use');
//       }

//       if (err.message.includes('username_uidx')) {
//         throw new DuplicateUsernameError(`Username "${username}" already in use`);
//       }
//     }

//     throw err;
//   } finally {
//     session.endSession();
//   }
// }