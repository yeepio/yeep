import path from 'path';
import chalk from 'chalk';
import { renderMissingConfig, renderInvalidMigrationDir, renderNativeError } from './templates';
import { migrateUp, migrateDown } from '../server/utils/dbMigrator';

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

    console.log('Migrating yeep database');

    // load config file from path
    let config;
    try {
      config = require(path.resolve(flagsObj.config));
    } catch (err) {
      console.error(renderNativeError(err));
    }

    (dir === 'up' ? migrateUp : migrateDown)({
      migrationId: flagsObj.to,
      migrationDir: path.resolve(config.mongo.migrationDir),
      mongoUri: config.mongo.uri,
      verbose: true,
    })
      .then(() => {
        console.log(chalk.green('✓'), 'Migration complete');
      })
      .catch((err) => {
        console.error(renderNativeError(err));
      });
  }
};

export default handleMigrate;
