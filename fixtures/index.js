// import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import config from '../yeep.config';
// import { registerModels } from '../server/models';
// import { ObjectId } from 'mongodb';
// import { createFakeUsers, deleteAllUsers, generateFakeUser, deleteFakeUser } from './user';
import { generateFakeUser } from './users';
import { generateFakeOrg } from './orgs';
import { generateFakePermissions } from './permissions';
import { promisify } from 'util';

const writeFileAsync = promisify(fs.writeFile);
// const init = async () => {
//   // create mongodb connection
//   const db = await mongoose.createConnection(config.mongo.uri, {
//     useNewUrlParser: true,
//     useFindAndModify: false,
//     autoIndex: false,
//     bufferCommands: false,
//     ignoreUndefined: true,
//   });

//   registerModels(db);

//   const hrstart = process.hrtime();
//   const numberOfUsers = 10000;

//   const users = await createFakeUsers(db, numberOfUsers);
//   const hrend = process.hrtime(hrstart)

//   console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)

//   await deleteAllUsers(db, users);

//   db.close();
// };

// init();

const generateFakeUsers = (numberOfUsers) => {
  const users = [];
  for (var i = numberOfUsers - 1; i >= 0; i--) {
    const user = generateFakeUser();
    users.push(user);
  }

  return users;
}

const generateFakeOrgs = (numberOfOrgs) => {
  const orgs = [];
  for (var i = numberOfOrgs - 1; i >= 0; i--) {
    const org = generateFakeOrg();
    orgs.push(org);
  }

  return orgs;
}

const generatePermissionsFromOrgs = (config, orgs) => {
  const permissions = [];
  orgs.forEach((org) => {
    const [ readPermission, writePermission ] = generateFakePermissions(config, org);
    permissions.push(readPermission);
    permissions.push(writePermission);
  });

  return permissions;
}

// const generateRolesFromPermissions = (config, permissions) => {
//   const roles = [];
//   permissions.forEach((org) => {
//     const [ readPermission, writePermission ] = generateFakePermissions(config, org);
//     roles.push(readPermission);
//     roles.push(writePermission);
//   });

//   return permissions;
// }

const generateFixtures = async () => {
  const numberOfUsers = 10;
  const numberOfOrgs = 5;
  const hrstart = process.hrtime();
  const users = generateFakeUsers(numberOfUsers);
  const orgs = generateFakeOrgs(numberOfOrgs);
  const permissions = generatePermissionsFromOrgs(config, orgs);
  const dataPath = path.join(__dirname, './data/data.json');
  const usersPath = path.join(__dirname, './data/users.json');
  const orgsPath = path.join(__dirname, './data/orgs.json');
  const permissionsPath = path.join(__dirname, './data/permissions.json');

  await writeFileAsync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
  await writeFileAsync(orgsPath, JSON.stringify(orgs, null, 2), 'utf-8');
  await writeFileAsync(permissionsPath, JSON.stringify(permissions, null, 2), 'utf-8');

  await writeFileAsync(dataPath, JSON.stringify({ users, orgs, permissions }), 'utf-8');

  const hrend = process.hrtime(hrstart);
  console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)
}


generateFixtures();