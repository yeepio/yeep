import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { MongoClient, ObjectId } from 'mongodb';
import { promisify } from 'util';
import { PASSWORD } from '../server/constants/authFactorTypes';

const randomBytes = promisify(crypto.randomBytes);
const pbkdf2 = promisify(crypto.pbkdf2);
const readFileAsync = promisify(fs.readFile);

const connectDb = async (uri) => {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true });
  return client;
}

const getAdminRole = async (db) => {
  const adminRole = db.collection('roles').findOne({ name: 'admin' });
  if (!adminRole) {
    throw new Error('Admin Role does not already exist in the database, please make sure you have run all the correct migrations');
  }
  return adminRole;
}

const saveAdminUser = async (db, user) => {
  const salt = await randomBytes(128);
  const iterations = 100000; // ~0.3 secs on Macbook Pro Late 2011
  const digestedPassword = await pbkdf2(user.password, salt, iterations, 128, 'sha512');
  await db.collection('authFactors').insertOne({
    user: ObjectId(user.id),
    password: digestedPassword,
    type: PASSWORD,
    salt,
    iterationCount: iterations,
    isFixture: true,
  });

  const adminRole = await getAdminRole(db);
  db.collection('orgMemberships').insertOne({
    userId: ObjectId(user.id),
    orgId: null,
    roles: [{
      id: adminRole._id,
    }],
    isFixture: true,
  });
}

const saveUsers = async (db, users) => {
  let bulk = db.collection('users').initializeUnorderedBulkOp();
  users.forEach((user) => {
    // later used for identifying all fixture data
    user.isFixture = true;
    user.createdAt = new Date();
    user.updatedAt = new Date();
    // we need to create credentials for this password if we need to keep it
    const { password, ...dbUser } = user; // eslint-disable-line
    bulk.insert(dbUser);
  });
  const operation = await bulk.execute();
  return operation.result.insertedIds.map((user) => user._id.toString());
};

const saveOrgs = async (db, orgs) => {
  let bulk = db.collection('orgs').initializeUnorderedBulkOp();
  orgs.forEach((org) => {
    // later used for identifying all fixture data
    org.isFixture = true;
    org.createdAt = new Date();
    org.updatedAt = new Date();
    bulk.insert(org);
  });
  const operation = await bulk.execute();
  return operation.result.insertedIds.map((org) => org._id.toString());
};

const savePermissions = async (db, permissions) => {
  let bulk = db.collection('permissions').initializeUnorderedBulkOp();
  permissions.forEach((permission) => {
    // later used for identifying all fixture data
    permission.isFixture = true;
    permission.createdAt = new Date();
    permission.updatedAt = new Date();
    bulk.insert(permission);
  });
  const operation = await bulk.execute();
  return operation.result.insertedIds.map((permission) => permission._id.toString());
};

const saveRoles = async (db, roles) => {
  let bulk = db.collection('roles').initializeUnorderedBulkOp();
  roles.forEach((role) => {
    // later used for identifying all fixture data
    role.isFixture = true;
    role.createdAt = new Date();
    role.updatedAt = new Date();
    bulk.insert(role);
  });
  const operation = await bulk.execute();
  return operation.result.insertedIds.map((role) => role._id.toString());
};

const loadFixtures = async (config, inputPath) => {
  const dataPath = inputPath || path.join(__dirname, '../fixtures/data/data.json');
  const dataTxt = await readFileAsync(dataPath, 'utf-8');
  const data = JSON.parse(dataTxt);

  const client = await connectDb(config.mongo.uri);
  const db = client.db();

  try {
    const userIds = await saveUsers(db, data.users);
    const adminUser = data.users[0];
    adminUser.id = userIds[0];

    await saveAdminUser(db, adminUser);

    const orgIds = await saveOrgs(db, data.orgs);
    
    const editedPermissions = data.permissions.map((permission) => {
      const orgIndex = data.orgs.findIndex((org) => org.slug === permission.scope);
      permission.scope = orgIds[orgIndex];
      return permission;
    });

    const permissionIds = await savePermissions(db, editedPermissions);
    const permissionsWithIds = editedPermissions.map((permission, idx) => {
      permission.id = permissionIds[idx];
      return permission;
    });

    const editedRoles = data.roles.map((role) => {
      const orgIndex = data.orgs.findIndex((org) => org.slug === role.scope);
      role.scope = orgIds[orgIndex];
      // we need to replace permission names with their generated ids
      role.permissions = role.permissions.map((permissionName) => {
        const foundPermission = permissionsWithIds.find((permission) => {
          return permission.name === permissionName;
        });

        return foundPermission.id;
      });
      return role;
    });
    await saveRoles(db, editedRoles);

    return adminUser;
  } catch (err) {
    throw err;
  } finally {
    client.close();
  }
};

export default loadFixtures;
