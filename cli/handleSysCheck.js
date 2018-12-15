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

const validateMongo = async (uri, spinner) => {
  const client = await MongoClient.connect(
    uri,
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
    if (!isVersionValid) {
      throw new Error(
        `Incompatible MongoDB version detected; yeep requires v.4+, current version is ${
          buildInfo.version
        }`
      );
    }
    spinner.stopAndPersist({
      symbol: chalk.green('✔'),
      text: `Mongo version ${buildInfo.version} is valid`,
    });

    try {
      await db.admin().replSetGetStatus();
    } catch (err) {
      throw new Error('Invalid MongoDB deployment status; yeep requires a replica set');
    }
    spinner.stopAndPersist({
      symbol: chalk.green('✔'),
      text: 'Mongo replica set detected',
    });

    // check migrations
    const dbMigrator = new DatabaseMigrator({
      mongoUri: uri,
      migrationDir: path.resolve(__dirname, '../migrations'),
    });

    try {
      await dbMigrator.connect();
      const pendingMigrations = await dbMigrator.findPendingMigrations();
      if (pendingMigrations.length !== 0) {
        throw new Error('Pending migrations detected; please apply all db migrations');
      }
    } catch (err) {
      throw err;
    } finally {
      await dbMigrator.disconnect();
    }
  } catch (err) {
    throw err;
  } finally {
    await client.close();
  }
};

const validateStorage = async (type, directory, spinner) => {
  if (type !== 'fs') {
    return;
  }
  const dirExists = await dirExistsAsync(directory);
  if (!dirExists) {
    throw new Error(`Upload directory ${directory} does not exist`);
  }
  spinner.stopAndPersist({
    symbol: chalk.green('✔'),
    text: 'Upload directory exists',
  });

  try {
    await accessAsync(directory, fs.W_OK);
  } catch (err) {
    throw new Error(`Upload directory ${directory} does not have write permissions`);
  }

  spinner.stopAndPersist({
    symbol: chalk.green('✔'),
    text: 'Upload Directory has write permissions',
  });
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

    validateMongo(config.mongo.uri, spinner)
      .then(() => validateStorage(config.storage.type, config.storage.uploadDir, spinner))
      .then(() => spinner.succeed('System check complete.'))
      .catch((err) => {
        console.error(renderNativeError(err));
        spinner.fail('System check failed.');
      });
  }
};

export default handleSysCheck;
