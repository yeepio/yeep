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

export const renderInvalidFixturesAction = (action) => `
  ${chalk.red('Error: unknown fixtures action')}
    expected "generate", "load" or "unload", received "${action}"

  See 'yeep --help'.
`;

export const renderNativeError = (err) => `
  ${chalk.red(`Error: ${err.message}`)}
`;

export const successMessage = (message) => `
  ${chalk.green('✔')} ${message}
`;

export const renderMissingConfigParameter = (param, destination, parent) => `
  ${chalk.red('Validation Failed')}
  Configuration File: ${destination}

  Missing property "${param}" ${parent ? `from key "${parent.join('.')}"` : ''}
`;

export const renderWrongFormatForParam = (value, param, message, allowedValues, destination) => `
  ${chalk.red('Validation Failed')}
  Configuration File: ${destination}

  Value "${value}" for property "${param}" ${message}
  ${allowedValues ? `Allowed values: ${allowedValues}` : ''}
`;
