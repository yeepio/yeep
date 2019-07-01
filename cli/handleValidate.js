import path from 'path';
import Ajv from 'ajv';
import {
  renderMissingConfig,
  renderNativeError,
  successMessage,
  renderMissingConfigParameter,
  renderWrongFormatForParam,
} from './templates';
import schema from '../server/constants/config.schema.json';

const renderHelp = () => `
  validates the designated config file

  USAGE
    $ yeep validate

  OPTIONS
    -c, --config=<path>   path to yeep configuration file (required)

  EXAMPLES
    $ yeep validate --config=yeep.config.js
`;

const CLASSES = {
  'Function': Function,
};

const handleValidate = (inputArr, flagsObj) => {
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
    const ajv = new Ajv();
    ajv.addKeyword('instanceof', {
      compile: (schema) => {
        const Class = CLASSES[schema];
        return (data) => data instanceof Class;
      }
    });
    const validate = ajv.compile(schema);
    const valid = validate(config);
    if (!valid) {
      // errors array will always contain one element, unless specified otherwise in the instantiation
      const error = validate.errors[0];
      const errorType = error.keyword;
      const parent = error.dataPath.split('.').splice(1);
      if (errorType === 'required') {
        console.error(
          renderMissingConfigParameter(error.params.missingProperty, configPath, parent)
        );
      } else {
        const currentValue = parent.reduce((o, i) => o[i], config);
        const allowedValues = error.params.allowedValues;
        console.error(
          renderWrongFormatForParam(
            currentValue,
            parent.join('.'),
            error.message,
            allowedValues,
            configPath
          )
        );
      }
    } else {
      console.log(successMessage(`Configuration OK`));
    }
  }
};

export default handleValidate;
