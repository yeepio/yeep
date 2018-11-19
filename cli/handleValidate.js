import { renderMissingConfig } from './templates';

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
    console.log(123);
  }
};

export default handleValidate;
