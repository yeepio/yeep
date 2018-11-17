const { renderInvalidCommand } = require('./templates');

const renderHelp = () => `
  CLI to interact with yeep.

  USAGE
    $ yeep [--version] [--help] <command> [<args>]

  COMMANDS
    start      starts the yeep server
    validate   validates the designated config file
    syscheck   performs a systems-check and prints diagnostics
    migrate    applies database migration

  EXAMPLES
    $ yeep start --config=yeep.config.js
`;

const handleBase = (inputArr) => {
  if (inputArr.length !== 0) {
    console.error(renderInvalidCommand(inputArr[0]));
  } else {
    console.log(renderHelp());
  }
};

module.exports = handleBase;
