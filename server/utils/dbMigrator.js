import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import last from 'lodash/last';
import head from 'lodash/head';
import { MongoClient } from 'mongodb';

const readdirAsync = promisify(fs.readdir);

const findLatestAppliedMigrationIndex = (migrationFiles, migrationRecords) => {
  if (migrationRecords.length === 0) {
    return -1;
  }

  const needle = last(migrationRecords)._id;
  return migrationFiles.findIndex((e) => e === needle);
};

export const migrateUp = async ({ migrationId, migrationDir, mongoUri, verbose = false }) => {
  // retrieve file names from migration dir
  const migrationFiles = await readdirAsync(migrationDir);

  // ensure migration dir is NOT empty
  if (migrationFiles.length === 0) {
    throw new Error('No migration files found');
  }

  // resolve specified migration id
  const targetMigrationFile = migrationId
    ? migrationId.endsWith('.js')
      ? migrationId
      : `${migrationId}.js`
    : last(migrationFiles);

  // find target migration file index
  const targetMigrationFileIndex = migrationFiles.findIndex(
    (migrationFile) => migrationFile === targetMigrationFile
  );

  // ensure migration file exists
  if (targetMigrationFileIndex === -1) {
    throw new Error(`Migration file "${targetMigrationFile}" cannot be found`);
  }

  // connect to db
  const client = await MongoClient.connect(
    mongoUri,
    {
      useNewUrlParser: true,
      ignoreUndefined: true,
    }
  );
  const db = client.db();

  try {
    // create "migrations" collection (if not already exists)
    await db.createCollection('migrations');

    // retrieve db migration records
    const migrationRecords = await db
      .collection('migrations')
      .find({})
      .toArray();

    // check if specified migration is already applied
    if (migrationRecords.some((record) => record._id === targetMigrationFile)) {
      return; // exit gracefully
    }

    // find latest applied migration
    const latestAppliedMigrationIndex = findLatestAppliedMigrationIndex(
      migrationFiles,
      migrationRecords
    );

    // ensure migration order is maintained
    if (latestAppliedMigrationIndex > targetMigrationFile) {
      throw new Error('Inconsistent migration state');
    }

    // determine migration queue
    const migrationQueue = migrationFiles.slice(
      latestAppliedMigrationIndex + 1,
      targetMigrationFileIndex + 1
    );

    // process migration queue
    for (let i = 0; i < migrationQueue.length; i += 1) {
      const migration = require(path.join(migrationDir, migrationQueue[i]));
      await migration.up(db);
      await db.collection('migrations').insertOne({
        _id: migrationQueue[i],
      });
      if (verbose) {
        console.log('↑', migrationQueue[i]);
      }
    }
  } catch (err) {
    throw err;
  } finally {
    await client.close();
  }
};

export const migrateDown = async ({ migrationId, migrationDir, mongoUri, verbose = false }) => {
  // retrieve file names from migration dir
  const migrationFiles = await readdirAsync(migrationDir);

  // ensure migration dir is NOT empty
  if (migrationFiles.length === 0) {
    throw new Error('No migration files found');
  }

  // resolve specified migration id
  const targetMigrationFile = migrationId
    ? migrationId.endsWith('.js')
      ? migrationId
      : `${migrationId}.js`
    : head(migrationFiles);

  // find target migration file index
  const targetMigrationFileIndex = migrationFiles.findIndex(
    (migrationFile) => migrationFile === targetMigrationFile
  );

  // ensure migration file exists
  if (targetMigrationFileIndex === -1) {
    throw new Error(`Migration file "${targetMigrationFile}" cannot be found`);
  }

  // connect to db
  const client = await MongoClient.connect(
    mongoUri,
    {
      useNewUrlParser: true,
      ignoreUndefined: true,
    }
  );
  const db = client.db();

  try {
    // create "migrations" collection (if not already exists)
    await db.createCollection('migrations');

    // retrieve db migration records
    const migrationRecords = await db
      .collection('migrations')
      .find({})
      .toArray();

    // check if specified migration is NOT applied
    if (migrationRecords.every((record) => record._id !== targetMigrationFile)) {
      return; // exit gracefully
    }

    // find latest applied migration
    const latestAppliedMigrationIndex = findLatestAppliedMigrationIndex(
      migrationFiles,
      migrationRecords
    );

    // determine migration queue
    const migrationQueue = migrationFiles.slice(
      targetMigrationFileIndex,
      latestAppliedMigrationIndex + 1
    );

    // process migration queue in reverse
    for (let i = migrationQueue.length - 1; i >= 0; i -= 1) {
      await db.collection('migrations').deleteOne({
        _id: migrationQueue[i],
      });
      const migration = require(path.join(migrationDir, migrationQueue[i]));
      await migration.down(db);
      if (verbose) {
        console.log('↓', migrationQueue[i]);
      }
    }
  } catch (err) {
    throw err;
  } finally {
    await client.close();
  }
};
