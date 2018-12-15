import path from 'path';
import ora from 'ora';
import fs from 'fs';
import { promisify } from 'util';
import chalk from 'chalk';
import DatabaseMigrator from '../server/utils/DatabaseMigrator';
import { renderMissingConfig, renderNativeError } from './templates';
import { MongoClient } from 'mongodb';

const dirExistsAsync = promisify(fs.exists);
const accessAsync = promisify(fs.access);

const renderHelp = () => `
  performs a systems-check and prints diagnostics

  USAGE
    $ yeep syscheck

  OPTIONS
    -c, --config=<path>   path to yeep configuration file (required)

  EXAMPLES
    $ yeep syscheck --config=yeep.config.js
`;

const validateMongoSetup = async (config, spinner) => {
  const client = await MongoClient.connect(
    config.mongo.uri,
    { useNewUrlParser: true }
  );

  spinner.stopAndPersist({
    symbol: chalk.green('✔'),
    text: 'Connected to database',
  });

  const db = client.db();
  try {
    // TODO: Verify that the uri has the username:password format if the authentication fails!
    const buildInfo = await db.admin().buildInfo();
    const isVersionValid = buildInfo.versionArray[0] >= 4;

    if (isVersionValid) {
      spinner.stopAndPersist({
        symbol: chalk.green('✔'),
        text: `Mongo v.${buildInfo.version} detected`,
      });
    } else {
      throw new Error(
        `Incompatible MongoDB version detected; yeep requires v.4+, current version is ${
          buildInfo.version
        }`
      );
    }

    try {
      await db.admin().replSetGetStatus();
      spinner.stopAndPersist({
        symbol: chalk.green('✔'),
        text: 'Mongo replica set detected',
      });
    } catch (err) {
      throw new Error('Invalid MongoDB deployment status; yeep requires a replica set');
    }
  } finally {
    await client.close();
  }
};

const validateMigrationStatus = async (config) => {
  const dbMigrator = new DatabaseMigrator({
    mongoUri: config.mongo.uri,
    migrationDir: path.resolve(__dirname, '../migrations'),
  });

  try {
    await dbMigrator.connect();
    const pendingMigrations = await dbMigrator.findPendingMigrations();
    if (pendingMigrations.length !== 0) {
      throw new Error('Pending migrations detected; please apply all db migrations');
    }
  } finally {
    await dbMigrator.disconnect();
  }
};

const validateStorage = async (config, spinner) => {
  if (config.storage.type !== 'fs') {
    return;
  }

  const dirExists = await dirExistsAsync(config.storage.uploadDir);
  if (dirExists) {
    spinner.stopAndPersist({
      symbol: chalk.green('✔'),
      text: 'Upload directory exists',
    });
  } else {
    throw new Error(`Upload directory ${config.storage.uploadDir} does not exist`);
  }

  try {
    await accessAsync(config.storage.uploadDir, fs.W_OK);
    spinner.stopAndPersist({
      symbol: chalk.green('✔'),
      text: 'Upload directory has write permissions',
    });
  } catch (err) {
    throw new Error(`Upload directory ${config.storage.uploadDir} does not have write permissions`);
  }
};

const handleSysCheck = (inputArr, flagsObj) => {
  if (flagsObj.help) {
    console.log(renderHelp());
  } else if (!flagsObj.config) {
    console.error(renderMissingConfig());
  } else {
    let config;
    const configPath = path.resolve(flagsObj.config);
    try {
      config = require(configPath);
    } catch (err) {
      console.error(renderNativeError(err));
    }
    const spinner = ora();
    spinner.start('Checking system status...');

    validateMongoSetup(config, spinner)
      .then(() => validateMigrationStatus(config, spinner))
      .then(() => validateStorage(config, spinner))
      .then(() => spinner.succeed('System check complete: all systems are functional'))
      .catch((err) => {
        spinner.fail(`${err.message}`);
        spinner.fail('System check failed');
      });
  }
};

export default handleSysCheck;
