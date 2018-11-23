import chalk from 'chalk';

export const renderMissingConfig = () => `
  ${chalk.red('Error: missing required "config" flag.')}
    -c, --config=<path>   path to yeep configuration file

  See 'yeep --help'.
`;

export const renderInvalidMigrationDir = (dir) => `
  ${chalk.red('Error: unknown migration direction')}
    expected "up" or "down", received "${dir}"

  See 'yeep --help'.
`;

export const renderInvalidCommand = (command) => `
  ${chalk.red(`Error: "${command}" is not a yeep command.`)}

  See 'yeep --help'.
`;

export const renderNativeError = (err) => `
  ${chalk.red(`Error: ${err.message}`)}
`;

export const successMessage = (message) => `
  ${chalk.green('✔')} ${message}
`;

export const renderMissingConfigParameter = (param, destination) => `
  ${chalk.red('Validation Failed')}
  Missing parameter "${param}" from ${destination}
`;
