import path from 'path';
import ora from 'ora';
import chalk from 'chalk';
import { renderMissingConfig, renderNativeError } from './templates';
import { MongoClient } from 'mongodb';

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
      spinner.fail(`Mongo version ${buildInfo.version} needs to be higher than 4.0.0`);
      throw new Error('Mongo version missmatch');
    }
    spinner.stopAndPersist({
      symbol: chalk.green('✔'),
      text: `Mongo version ${buildInfo.version} is valid (>= 4.0.0)`,
    });

    let replStatus;
    try {
      replStatus = await db.admin().replSetGetStatus();
    } catch (err) {
      spinner.fail(`Mongo database needs to exist within a replica set`);
      throw err;
    }
    spinner.stopAndPersist({
      symbol: chalk.green('✔'),
      text: `Mongo replica set ${replStatus.set} found`,
    });

    // check migrations
  } catch (err) {
    throw err;
  } finally {
    await client.close();
  }
};

const validateStorage = async (directory) => {
  return directory;
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
      .then(() => {
        spinner.succeed('System check complete.');
      })
      .catch((err) => {
        // i didn't like the extra space of the text from the x of the spinner
        spinner.fail('System check failed');
        console.error(renderNativeError(err));
      });

    if (config.storage && config.storage.type === 'fs') {
      validateStorage(config.storage.uploadDir)
        .then(() => {
          spinner.succeed('File system check complete');
        })
        .catch((err) => {
          spinner.fail('System check failed');
          console.error(renderNativeError(err));
        });
    }
  }
};

export default handleSysCheck;
