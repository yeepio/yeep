import path from 'path';
import ora from 'ora';
import {
  renderMissingConfig,
  renderNativeError,
  renderInvalidFixturesAction,
} from './templates';
import generateFixtures from '../fixtures/generate';
import loadFixtures from '../fixtures/load';
import unloadFixtures from '../fixtures/unload';

const renderHelp = () => `
  generates fixtures, loads them to the database or deletes them, for testing purposes

  USAGE
    $ yeep fixtures generate|load|unload

  OPTIONS
    -c, --config=<path>       path to yeep configuration file (required)
    -o, --output-path=<path>  path to output json file
    -v, --verbose             prints json file in human readable format
    -i, --input-path=<path>   path to input json file
    -n                        number of generated fixtures


  EXAMPLES
    $ yeep fixtures generate --config=yeep.config.js
`;

const handleFixtures = (inputArr, flagsObj) => {
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

    const action = inputArr[1];

    if (!['generate', 'load', 'unload'].includes(action)) {
      console.error(renderInvalidFixturesAction(action));
      return;
    }

    const spinner = ora();

    if (action === 'generate') {
      spinner.start('Generating fixtures...');
      generateFixtures(flagsObj.n, flagsObj.o, flagsObj.v)
        .then((dataPath) => {
          spinner.succeed(`Generated fixture are under ${dataPath}`);
        })
        .catch((err) => {
          spinner.fail(`${err.message}`);
          spinner.fail('Generating fixtures failed');
        });
    } else if (action === 'load') {
      spinner.start('Loading fixtures to the database...');
      loadFixtures(config, flagsObj.i)
        .then((adminUser) => {
          spinner.succeed('Loaded all fixtures to the database');
          spinner.succeed('Your administrator user is');
          spinner.succeed(JSON.stringify(adminUser, null , 2));
        })
        .catch((err) => {
          spinner.fail(`${err.message}`);
          spinner.fail('Loading fixtures failed');
        });
    } else if (action === 'unload') {
      spinner.start('Dropping fixtures from the database...');
      unloadFixtures(config)
        .then(() => {
          spinner.succeed('Dropped all fixtures from the database');
        })
        .catch((err) => {
          spinner.fail(`${err.message}`);
          spinner.fail('Failed dropping fixtures');
        });
    }
  }
};

export default handleFixtures;
