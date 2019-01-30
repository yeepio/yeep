import path from 'path';
import isString from 'lodash/isString';
import merge from 'lodash/merge';
import typeOf from 'typeof';

class ConfigurationLoader {
  loadFromPath(configPath) {
    if (!isString(configPath)) {
      throw new Error(`
        Invalid configPath argument; expected string, received ${typeOf(configPath)}
      `);
    }

    this.props = {
      configPath,
    };

    const configuration = require(path.resolve(configPath));
    const defaultConfiguration = require(path.resolve(__dirname, '../../yeep.config.sample'));

    return merge(defaultConfiguration, configuration);
  }
}

export default ConfigurationLoader;
