import fs from 'fs';
import path from 'path';
import config from '../yeep.config';
import { generateFakeUser } from './models/users';
import { generateFakeOrg } from './models/orgs';
import { generateFakePermissions } from './models/permissions';
import { generateFakeRoles } from './models/roles';
import { promisify } from 'util';

const writeFileAsync = promisify(fs.writeFile);

const generateManyFakeUsers = (numberOfUsers) => {
  const users = [];
  // usernames are taken from the email property so both are unique
  const uniqueUsernames = new Set();
  for (var i = numberOfUsers - 1; i >= 0; i--) {
    // maintain some sane loops
    let count = 0;
    while (count < 100) {
      let user = generateFakeUser();
      if (!uniqueUsernames.has(user.username)) {
        uniqueUsernames.add(user.username);
        users.push(user);
        break;
      }
      count ++;
    }
  }

  uniqueUsernames.clear();
  return users;
}

const generateFakeOrgs = (numberOfOrgs) => {
  const orgs = [];
  const uniqueSlugs = new Set();
  for (var i = numberOfOrgs - 1; i >= 0; i--) {
    // maintain some sane loops
    let count = 0;
    while (count < 100) {
      let org = generateFakeOrg();
      if (!uniqueSlugs.has(org.slug)) {
        uniqueSlugs.add(org.slug);
        orgs.push(org);
        break;
      }
      count ++;
    }
  }

  uniqueSlugs.clear();
  return orgs;
}

const generatePermissionsAndRolesFromOrgs = (config, orgs) => {
  const permissions = [];
  const roles = [];
  orgs.forEach((org) => {
    const [ readPermission, writePermission ] = generateFakePermissions(config, org);
    const [ readerRole, editorRole, adminRole ] = generateFakeRoles(org);
    readerRole.permissions.push(readPermission.name);
    editorRole.permissions.push(writePermission.name);
    adminRole.permissions.push(readPermission.name, writePermission.name);
    roles.push(readerRole, editorRole, adminRole);
    permissions.push(readPermission, writePermission);
  });

  return [ permissions, roles ];
}

const generateFixtures = async (count, outputPath, verbose) => {
  const numberOfUsers = count;
  const numberOfOrgs = Math.ceil(count/3);
  const hrstart = process.hrtime();
  const users = generateManyFakeUsers(numberOfUsers);
  const orgs = generateFakeOrgs(numberOfOrgs);
  const [ permissions, roles ] = generatePermissionsAndRolesFromOrgs(config, orgs);
  const dataPath = outputPath || path.join(__dirname, './data/data.json');
  if (verbose) {
    const usersPath = path.join(__dirname, './data/users.json');
    const orgsPath = path.join(__dirname, './data/orgs.json');
    const permissionsPath = path.join(__dirname, './data/permissions.json');
    const rolesPath = path.join(__dirname, './data/roles.json');

    await writeFileAsync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    await writeFileAsync(orgsPath, JSON.stringify(orgs, null, 2), 'utf-8');
    await writeFileAsync(permissionsPath, JSON.stringify(permissions, null, 2), 'utf-8');
    await writeFileAsync(rolesPath, JSON.stringify(roles, null, 2), 'utf-8');
  }

  await writeFileAsync(dataPath, JSON.stringify({ users, orgs, permissions, roles }), 'utf-8');

  const hrend = process.hrtime(hrstart);
  console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000);
  return dataPath;
}

export default generateFixtures;