import path from 'path';
import Ajv from 'ajv';
import {
  renderMissingConfig,
  renderNativeError,
  successMessage,
  renderMissingConfigParameter,
} from './templates';
import schema from './configuration.schema';

const renderHelp = () => `
  validates the designated config file

  USAGE
    $ yeep validate

  OPTIONS
    -c, --config=<path>   path to yeep configuration file (required)

  EXAMPLES
    $ yeep validate --config=yeep.config.js
`;

const handleValidate = (inputArr, flagsObj) => {
  if (flagsObj.help) {
    console.log(renderHelp());
  } else if (!flagsObj.config) {
    console.error(renderMissingConfig());
  } else {
    const ajv = new Ajv();
    let config;
    const configPath = path.resolve(flagsObj.config);
    try {
      config = require(configPath);
    } catch (err) {
      console.error(renderNativeError(err));
    }
    const validate = ajv.compile(schema);
    const valid = validate(config);
    if (!valid) {
      const missingParams = validate.errors[0].params.missingProperty;
      console.error(renderMissingConfigParameter(missingParams, configPath));
    } else {
      console.log(successMessage(`Configuration OK`));
    }
  }
};

export default handleValidate;
