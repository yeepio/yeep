import { renderMissingConfig } from './templates';

const renderHelp = () => `
  performs a systems-check and prints diagnostics

  USAGE
    $ yeep syscheck

  OPTIONS
    -c, --config=<path>   path to yeep configuration file (required)

  EXAMPLES
    $ yeep syscheck --config=yeep.config.js
`;

const handleSysCheck = (inputArr, flagsObj) => {
  if (flagsObj.help) {
    console.log(renderHelp());
  } else if (!flagsObj.config) {
    console.error(renderMissingConfig());
  } else {
    console.log(123);
  }
};

export default handleSysCheck;
