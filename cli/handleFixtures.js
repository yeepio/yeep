import path from 'path';
import ora from 'ora';
import {
  renderMissingConfig,
  renderNativeError,
  renderInvalidFixturesAction,
} from './templates';
import schema from '../server/constants/config.schema.json';
import generateFixtures from '../fixtures/generate';
import loadFixtures from '../fixtures/load';
import clearFixtures from '../fixtures/clear';

const renderHelp = () => `
  generates fixtures, loads them to the database or deletes them, for testing purposes

  USAGE
    $ yeep fixtures generate|load|clear

  OPTIONS
    -c, --config=<path>       path to yeep configuration file (required)
    -o, --output-path=<path>  path to output json file
    -v, --verbose             prints json file in human readable format
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

    if (!['generate', 'load', 'clear'].includes(action)) {
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
      const dataPath = path.join(__dirname, '../fixtures/data/data.json');
      loadFixtures(dataPath)
        .then(() => {
          spinner.succeed('Loaded all fixtures to the database');
        })
        .catch((err) => {
          spinner.fail(`${err.message}`);
          spinner.fail('Loading fixtures failed');
        });
    } else if (action === 'clear') {
      spinner.start('Dropping fixtures from the database...');
      clearFixtures()
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
