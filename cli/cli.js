import meow from 'meow';
import handleDefault from './handleDefault';
import handleStart from './handleStart';
import handleValidate from './handleValidate';
import handleSysCheck from './handleSysCheck';
import handleMigrate from './handleMigrate';

const args = meow(
  `
  Usage:
    $ yeep [--version] [--help] <command> [<args>]

  Commands:
    start      starts the yeep server
    validate   validates the designated config file
    syscheck   performs a systems-check and prints diagnostics
    migrate    applies database migration

  Examples:
    $ yeep start --config=yeep.config.js
`,
  {
    flags: {
      config: {
        type: 'string',
        alias: 'c',
      },
      to: {
        type: 'string',
      },
    },
    autoHelp: false,
  }
);

switch (args.input[0]) {
  case 'start': {
    handleStart(args.input, args.flags);
    break;
  }
  case 'validate': {
    handleValidate(args.input, args.flags);
    break;
  }
  case 'syscheck': {
    handleSysCheck(args.input, args.flags);
    break;
  }
  case 'migrate': {
    handleMigrate(args.input, args.flags);
    break;
  }
  default: {
    handleDefault(args.input, args.flags);
  }
}
