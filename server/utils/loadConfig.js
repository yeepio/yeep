import path from 'path';
import isString from 'lodash/isString';
import merge from 'lodash/merge';
import typeOf from 'typeof';

const loadConfig = (configPath) => {
  if (!isString(configPath)) {
    throw new Error(`
      Invalid configPath argument; expected string, received ${typeOf(configPath)}
    `);
  }

  const configuration = require(path.resolve(configPath));
  const defaultConfiguration = require(path.resolve(__dirname, './yeep.config.default'));

  return merge(defaultConfiguration, configuration);
}

export default loadConfig;
