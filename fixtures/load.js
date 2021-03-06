import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { MongoClient, ObjectId } from 'mongodb';
import { promisify } from 'util';
import { PASSWORD } from '../server/constants/authFactorTypes';
import passwordSchema from '../server/models/AuthFactor-Password';

const authFactor = mongoose.model('authFactor', passwordSchema);
const readFileAsync = promisify(fs.readFile);

const connectDb = async (uri) => {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true });
  return client;
};

const getAdminRole = async (db) => {
  const adminRole = db.collection('roles').findOne({ name: 'admin' });
  if (!adminRole) {
    throw new Error(
      'Admin Role does not already exist in the database, please make sure you have run all the correct migrations'
    );
  }
  return adminRole;
};

const saveAdminUser = async (db, user) => {
  const salt = await authFactor.generateSalt();
  const iterations = 100000; // ~0.3 secs on Macbook Pro Late 2011
  const digestedPassword = await authFactor.digestPassword(user.password, salt, iterations);
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
    roles: [
      {
        id: adminRole._id,
      },
    ],
    isFixture: true,
  });
};

const saveUsers = async (db, users) => {
  const bulk = db.collection('users').initializeUnorderedBulkOp();
  const now = new Date();

  users.forEach((user) => {
    user.isFixture = true; // later used for identifying all fixture data
    user.createdAt = now;
    user.updatedAt = now;
    // we need to create credentials for this password if we need to keep it
    const { password, ...dbUser } = user; // eslint-disable-line
    bulk.insert(dbUser);
  });

  const operation = await bulk.execute();
  return operation.result.insertedIds.map((user) => user._id.toString());
};

const saveOrgs = async (db, orgs) => {
  const bulk = db.collection('orgs').initializeUnorderedBulkOp();
  const now = new Date();

  orgs.forEach((org) => {
    org.isFixture = true; // later used for identifying all fixture data
    org.createdAt = now;
    org.updatedAt = now;
    bulk.insert(org);
  });

  const operation = await bulk.execute();
  return operation.result.insertedIds.map((org) => org._id.toString());
};

const savePermissions = async (db, permissions) => {
  const bulk = db.collection('permissions').initializeUnorderedBulkOp();
  const now = new Date();

  permissions.forEach((permission) => {
    permission.scope = permission.scope ? ObjectId(permission.scope) : null;
    permission.isFixture = true; // later used for identifying all fixture data
    permission.createdAt = now;
    permission.updatedAt = now;
    bulk.insert(permission);
  });

  const operation = await bulk.execute();
  return operation.result.insertedIds.map((permission) => permission._id.toString());
};

const saveRoles = async (db, roles) => {
  const bulk = db.collection('roles').initializeUnorderedBulkOp();
  const now = new Date();

  roles.forEach((role) => {
    role.permissions = role.permissions.map(ObjectId);
    role.scope = role.scope ? ObjectId(role.scope) : null;
    role.isFixture = true; // later used for identifying all fixture data
    role.createdAt = now;
    role.updatedAt = now;
    bulk.insert(role);
  });

  const operation = await bulk.execute();
  return operation.result.insertedIds.map((role) => role._id.toString());
};

const saveOrgMemberships = async (db, userIds) => {
  const bulk = db.collection('orgMemberships').initializeUnorderedBulkOp();
  const now = new Date();

  userIds.forEach((userId) => {
    const orgMembership = {
      userId: ObjectId(userId),
      orgId: null,
      roles: [],
      permissions: [],
      expiresAt: null,
      isFixture: true,
      createdAt: now,
      updatedAt: now,
    };
    bulk.insert(orgMembership);
  });

  await bulk.execute();
};

const loadFixtures = async (config, inputPath) => {
  const dataPath = inputPath || path.join(__dirname, '../fixtures/data/data.json');
  const dataTxt = await readFileAsync(dataPath, 'utf-8');
  const data = JSON.parse(dataTxt);

  const client = await connectDb(config.mongo.uri);
  const db = client.db();

  try {
    const userIds = await saveUsers(db, data.users);
    const adminUserID = userIds.shift(); // not cool but it would create duplicates

    await saveOrgMemberships(db, userIds);

    const adminUser = data.users[0];
    adminUser.id = adminUserID;

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
