import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { renderMissingConfig, renderInvalidMigrationDir, renderNativeError } from './templates';
import DatabaseMigrator from '../server/utils/DatabaseMigrator';

const renderHelp = () => `
  applies database migration

  USAGE
    $ yeep migrate up|down

  OPTIONS
    -c, --config=<path>   path to yeep configuration file (required)
    --to=<migration_id>   migration point ID (optional)

  EXAMPLES
    $ yeep migrate up --config=yeep.config.js
`;

const handleMigrate = (inputArr, flagsObj) => {
  if (flagsObj.help) {
    console.log(renderHelp());
  } else if (!flagsObj.config) {
    console.error(renderMissingConfig());
  } else {
    const dir = inputArr[1];

    if (dir !== 'up' && dir !== 'down') {
      console.error(renderInvalidMigrationDir(dir));
      return;
    }

    // create spinner
    const spinner = ora();
    spinner.start('Migrating yeep database...');

    // load config file from path
    let config;
    try {
      config = require(path.resolve(flagsObj.config));
    } catch (err) {
      spinner.fail(renderNativeError(err));
    }

    const dbMigrator = new DatabaseMigrator({
      mongoUri: config.mongo.uri,
      migrationDir: path.resolve(__dirname, '../migrations'),
    });

    dbMigrator.once('migration', () => {
      spinner.info('Migrating yeep database...');
    });

    dbMigrator.on('migration', ({ dir, id }) => {
      spinner.stopAndPersist({
        symbol: dir === 'up' ? chalk.green('↑') : chalk.red('↓'),
        text: id,
      });
    });

    (dir === 'up' ? dbMigrator.migrateUp(flagsObj.to) : dbMigrator.migrateDown(flagsObj.to))
      .then(() => {
        spinner.succeed('Migration complete');
        dbMigrator.removeAllListeners();
      })
      .catch((err) => {
        spinner.fail(renderNativeError(err));
        dbMigrator.removeAllListeners('migration');
      });
  }
};

export default handleMigrate;
