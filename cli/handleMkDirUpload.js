import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import ora from 'ora';
import mkdirp from 'mkdirp';
import { renderMissingConfig, renderNativeError } from './templates';

const mkdirpAsync = promisify(mkdirp);

const renderHelp = () => `
  creates local upload directory with necessary permissions to upload files

  USAGE
    $ yeep mkdirupload

  OPTIONS
    -c, --config=<path>   path to yeep configuration file (required)

  EXAMPLES
    $ yeep mkdirupload --config=yeep.config.js
`;

export const renderInvalidStorageType = (type) =>
  `Error: invalid storage type "${type}"; expected "fs"`;

export const renderUploadDirAlreadyExists = (uploadDir) =>
  `Upload directory already exists at "${uploadDir}"`;

export const renderUploadDirCreated = (uploadDir) => `Upload directory created at "${uploadDir}"`;

const handleMkDirUpload = (inputArr, flagsObj) => {
  if (flagsObj.help) {
    console.log(renderHelp());
    return;
  }

  if (!flagsObj.config) {
    console.error(renderMissingConfig());
    return;
  }

  // create spinner
  const spinner = ora();
  spinner.start('Creating upload dir...');

  // load config file from path
  let config;
  try {
    config = require(path.resolve(flagsObj.config));
  } catch (err) {
    spinner.fail(renderNativeError(err));
  }

  // ensure storage type is "fs"
  if (config.storage.type !== 'fs') {
    spinner.fail(renderInvalidStorageType(config.storage.type));
  }

  // resolve uploaddir path
  const uploadDirPath = path.resolve(__dirname, '..', config.storage.uploadDir);

  // check if uploadDir already exists
  if (fs.existsSync(uploadDirPath)) {
    spinner.fail(renderUploadDirAlreadyExists(uploadDirPath));
  }

  // create uploadDir
  mkdirpAsync(uploadDirPath, { mode: 0o666 })
    .then(() => {
      spinner.succeed(renderUploadDirCreated(uploadDirPath));
    })
    .catch((err) => {
      spinner.fail(renderNativeError(err));
    });
};

export default handleMkDirUpload;
