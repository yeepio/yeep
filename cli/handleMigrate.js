const { renderMissingConfig, renderInvalidMigrationDir } = require('./templates');

const renderHelp = () => `
  applies database migration

  USAGE
    $ yeep migrate up|down

  OPTIONS
    -c, --config=<path>   path to yeep configuration file (required)
    --to=<migration_id>   migration point ID (optional)

  EXAMPLES
    $ yeep migrate up --config=yeep.config.js
`;

const handleMigrate = (inputArr, flagsObj) => {
  if (flagsObj.help) {
    console.log(renderHelp());
  } else if (!flagsObj.config) {
    console.error(renderMissingConfig());
  } else {
    switch (inputArr[1]) {
      case 'up':
        console.log(1);
        break;
      case 'down':
        console.log(2);
        break;
      default:
        console.error(renderInvalidMigrationDir(inputArr[1]));
    }
  }
};

module.exports = handleMigrate;
