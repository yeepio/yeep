import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import EventEmitter from 'events';
import last from 'lodash/last';
import head from 'lodash/head';
import difference from 'lodash/difference';
import isPlainObject from 'lodash/isPlainObject';
import isString from 'lodash/isString';
import typeOf from 'typeof';
import { MongoClient } from 'mongodb';

const readdirAsync = promisify(fs.readdir);

const findLatestAppliedMigrationIndex = (migrationFiles, appliedMigrations) => {
  if (appliedMigrations.length === 0) {
    return -1;
  }

  const needle = last(appliedMigrations);
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

  async connect() {
    // check if already connected
    if (this.client) {
      return;
    }

    // connect to mongodb
    const { mongoUri } = this.props;
    this.client = await MongoClient.connect(
      mongoUri,
      {
        useNewUrlParser: true,
        ignoreUndefined: true,
      }
    );
  }

  async disconnect() {
    // check if already disconnected
    if (!this.client) {
      return;
    }

    // connect to mongodb
    await this.client.close();
    this.client = null;
  }

  async getMigrationFiles() {
    const { migrationDir } = this.props;

    // retrieve file names from migration dir
    const migrationFiles = await readdirAsync(migrationDir);

    return migrationFiles;
  }

  async getAppliedMigrations() {
    // ensure db is connected
    if (!this.client) {
      throw new Error('Database not connected; did you forget to call connect()?');
    }

    // retrieve db migration records
    const migrationRecords = await this.client
      .db()
      .collection('migrations')
      .find({})
      .toArray();

    return migrationRecords.map((record) => record._id);
  }

  readSyncMigrationFile(fileName) {
    const { migrationDir } = this.props;

    return require(path.resolve(path.join(migrationDir, fileName)));
  }

  async findPendingMigrations() {
    // ensure db is connected
    if (!this.client) {
      throw new Error('Database not connected; did you forget to call connect()?');
    }

    // retrieve file names from migration dir
    const migrationFiles = await this.getMigrationFiles();

    // retrieve applied migrations
    const appliedMigrations = await this.getAppliedMigrations();

    return difference(migrationFiles, appliedMigrations);
  }

  async migrateUp(migrationId) {
    // ensure db is connected
    if (!this.client) {
      throw new Error('Database not connected; did you forget to call connect()?');
    }

    // retrieve file names from migration dir
    const migrationFiles = await this.getMigrationFiles();

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

    const db = this.client.db();

    // create "migrations" collection (if not already exists)
    await db.createCollection('migrations');

    // retrieve applied migrations
    const appliedMigrations = await this.getAppliedMigrations();

    // check if specified migration is already applied
    if (appliedMigrations.includes(targetMigrationFile)) {
      return; // migration is already applied - exit gracefully
    }

    // find latest applied migration
    const latestAppliedMigrationIndex = findLatestAppliedMigrationIndex(
      migrationFiles,
      appliedMigrations
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
      const migration = this.readSyncMigrationFile(migrationQueue[i]);
      await migration.up(db);
      await db.collection('migrations').insertOne({
        _id: migrationQueue[i],
      });
      this.emit('migration', {
        dir: 'up',
        id: migrationQueue[i],
      });
    }
  }

  async migrateDown(migrationId) {
    // ensure db is connected
    if (!this.client) {
      throw new Error('Database not connected; did you forget to call connect()?');
    }

    // retrieve file names from migration dir
    const migrationFiles = await this.getMigrationFiles();

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

    const db = this.client.db();

    // create "migrations" collection (if not already exists)
    await db.createCollection('migrations');

    // retrieve applied migrations
    const appliedMigrations = await this.getAppliedMigrations();

    // check if specified migration is NOT applied
    if (appliedMigrations.includes(targetMigrationFile)) {
      return; // exit gracefully
    }

    // find latest applied migration
    const latestAppliedMigrationIndex = findLatestAppliedMigrationIndex(
      migrationFiles,
      appliedMigrations
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
      const migration = this.readSyncMigrationFile(migrationQueue[i]);
      await migration.down(db);
      this.emit('migration', {
        dir: 'down',
        id: migrationQueue[i],
      });
    }
  }
}

export default DatabaseMigrator;
