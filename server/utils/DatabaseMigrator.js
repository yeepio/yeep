import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import EventEmitter from 'events';
import last from 'lodash/last';
import head from 'lodash/head';
import isPlainObject from 'lodash/isPlainObject';
import isString from 'lodash/isString';
import typeOf from 'typeof';
import { MongoClient } from 'mongodb';

const readdirAsync = promisify(fs.readdir);

const findLatestAppliedMigrationIndex = (migrationFiles, migrationRecords) => {
  if (migrationRecords.length === 0) {
    return -1;
  }

  const needle = last(migrationRecords)._id;
  return migrationFiles.findIndex((e) => e === needle);
};

class DatabaseMigrator extends EventEmitter {
  constructor(props) {
    super();

    if (!isPlainObject(props)) {
      throw new TypeError(
        `Invalid "props" argument; expected plain object, received ${typeOf(props)}`
      );
    }

    const { migrationDir, mongoUri } = props;

    if (!isString(migrationDir)) {
      throw new TypeError(
        `Invalid "migrationDir" property; expected string, received ${typeOf(migrationDir)}`
      );
    }

    if (!isString(mongoUri)) {
      throw new TypeError(
        `Invalid "mongoUri" property; expected string, received ${typeOf(mongoUri)}`
      );
    }

    this.props = {
      migrationDir,
      mongoUri,
    };
  }

  async migrateUp(migrationId) {
    const { migrationDir, mongoUri } = this.props;

    // retrieve file names from migration dir
    const migrationFiles = await readdirAsync(migrationDir);

    // ensure migration dir is NOT empty
    if (migrationFiles.length === 0) {
      throw new Error('No migration files found');
    }

    // resolve migration id
    let targetMigrationFile;
    let targetMigrationFileIndex;

    if (migrationId) {
      // ensure migration file ends with .js
      targetMigrationFile = migrationId.endsWith('.js') ? migrationId : `${migrationId}.js`;

      // find target migration file index
      targetMigrationFileIndex = migrationFiles.findIndex(
        (migrationFile) => migrationFile === targetMigrationFile
      );

      // ensure migration file exists
      if (targetMigrationFileIndex === -1) {
        throw new Error(`Migration file "${targetMigrationFile}" cannot be found`);
      }
    } else {
      targetMigrationFile = last(migrationFiles);
      targetMigrationFileIndex = migrationFiles.length - 1;
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
        return; // migration is already applied - exit gracefully
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

      // define migration queue
      const migrationQueue = migrationFiles.slice(
        latestAppliedMigrationIndex + 1,
        targetMigrationFileIndex + 1
      );

      // process migration queue
      for (let i = 0; i < migrationQueue.length; i += 1) {
        const migration = require(path.resolve(path.join(migrationDir, migrationQueue[i])));
        await migration.up(db);
        await db.collection('migrations').insertOne({
          _id: migrationQueue[i],
        });
        this.emit('migration', {
          dir: 'up',
          id: migrationQueue[i],
        });
      }
    } catch (err) {
      throw err;
    } finally {
      await client.close();
    }
  }

  async migrateDown(migrationId) {
    const { migrationDir, mongoUri } = this.props;

    // retrieve file names from migration dir
    const migrationFiles = await readdirAsync(migrationDir);

    // ensure migration dir is NOT empty
    if (migrationFiles.length === 0) {
      throw new Error('No migration files found');
    }

    // resolve migration id
    let targetMigrationFile;
    let targetMigrationFileIndex;

    if (migrationId) {
      // ensure migration file ends with .js
      targetMigrationFile = migrationId.endsWith('.js') ? migrationId : `${migrationId}.js`;

      // find target migration file index
      targetMigrationFileIndex = migrationFiles.findIndex(
        (migrationFile) => migrationFile === targetMigrationFile
      );

      // ensure migration file exists
      if (targetMigrationFileIndex === -1) {
        throw new Error(`Migration file "${targetMigrationFile}" cannot be found`);
      }
    } else {
      targetMigrationFile = head(migrationFiles);
      targetMigrationFileIndex = 0;
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
        const migration = require(path.resolve(path.join(migrationDir, migrationQueue[i])));
        await migration.down(db);
        this.emit('migration', {
          dir: 'down',
          id: migrationQueue[i],
        });
      }
    } catch (err) {
      throw err;
    } finally {
      await client.close();
    }
  }
}

export default DatabaseMigrator;
