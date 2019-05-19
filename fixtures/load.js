import fs from 'fs';
import { MongoClient } from 'mongodb';
import { promisify } from 'util';

const readFileAsync = promisify(fs.readFile);

const connectDb = async () => {
  const url = 'mongodb://localhost:27017';
  const client = await MongoClient.connect(url, { useNewUrlParser: true });
  return client;
}

const saveUsers = async (db, users) => {
  let bulk = db.collection('users').initializeUnorderedBulkOp();
  users.forEach((user) => {
    // later used for identifying all fixture data
    user.isFixture = true;
    user.createdAt = new Date();
    user.updatedAt = new Date();
    // we need to create credentials for this password if we need to keep it
    delete user.password;
    bulk.insert(user);
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

const loadFixtures = async (dataPath) => {

  const dataTxt = await readFileAsync(dataPath, 'utf-8');
  const data = JSON.parse(dataTxt);

  const dbName = 'test';
  const client = await connectDb();
  const db = client.db(dbName);
  console.log("\nwill load fixtures");

  try {
    await saveUsers(db, data.users);    
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
      role.permissions = role.permissions.map((permissionName, idx) => {
        const foundPermission = permissionsWithIds.find((permission) => {
          return permission.name === permissionName;
        });

        return foundPermission.id;
      });
      return role;
    });
    await saveRoles(db, editedRoles);
  } catch (err) {
    throw err;
  } finally {
    client.close();
  }
  return true;
};

export default loadFixtures;
