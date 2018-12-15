import { renderInvalidCommand } from './templates';

const renderHelp = () => `
  CLI to interact with yeep.

  USAGE
    $ yeep [--version] [--help] <command> [<args>]

  COMMANDS
    start         starts the yeep server
    validate      validates the designated config file
    syscheck      performs a systems-check and prints diagnostics
    migrate       applies database migration
    mkdirupload   creates local upload directory

  EXAMPLES
    $ yeep start --config=yeep.config.js
`;

const handleDefault = (inputArr) => {
  if (inputArr.length !== 0) {
    console.error(renderInvalidCommand(inputArr[0]));
  } else {
    console.log(renderHelp());
  }
};

export default handleDefault;
