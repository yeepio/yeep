import https from 'https';
import ora from 'ora';
import { format as formatUrl } from 'url';
import { renderMissingConfig, renderNativeError } from './templates';
import interopDefault from '../server/utils/interopDefault';
import ConfigurationLoader from '../server/utils/ConfigurationLoader';

const renderHelp = () => `
  starts the yeep server

  USAGE
    $ yeep start

  OPTIONS
    -c, --config=<path>   path to yeep configuration file (required)

  EXAMPLES
    $ yeep start --config=yeep.config.js
`;

const handleStart = (inputArr, flagsObj) => {
  if (flagsObj.help) {
    console.log(renderHelp());
  } else if (!flagsObj.config) {
    console.error(renderMissingConfig());
  } else {
    // create spinner
    const spinner = ora();
    spinner.info('Starting yeep server...');

    const configurationloader = new ConfigurationLoader();

    let config;
    try {
      // ensure all props exist to avoid extra checks further down the line
      config = configurationloader.loadFromPath(flagsObj.config);
    } catch (err) {
      spinner.fail(renderNativeError(err));
    }

    // load server
    const server = interopDefault(require('../server/server'));

    // start server
    server
      .setup(config)
      .then(() => {
        server.listen(config.port || 5000);
        const address = server.address();
        const baseUrl = formatUrl({
          protocol: server instanceof https.Server ? 'https' : 'http',
          hostname: address.address,
          port: address.port,
        });
        spinner.succeed(`Yeep server listening on ${baseUrl}`);
      })
      .catch((err) => {
        spinner.fail(renderNativeError(err));
      });
  }
};

export default handleStart;
