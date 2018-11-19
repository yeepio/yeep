import path from 'path';
import https from 'https';
import ora from 'ora';
import { format as formatUrl } from 'url';
import { renderMissingConfig, renderNativeError } from './templates';
import server from '../server/server';

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
    spinner.start('Starting yeep server');

    // load config file from path
    let config;
    try {
      config = require(path.resolve(flagsObj.config));
    } catch (err) {
      spinner.fail(renderNativeError(err));
    }

    // setup server
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
