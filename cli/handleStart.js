const { renderMissingConfig } = require('./templates');

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
    console.log(123);
  }
};

module.exports = handleStart;
