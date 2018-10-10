import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import isString from 'lodash/isString';
import typeOf from 'typeof';

const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const unlinkAsync = promisify(fs.unlink);

class FileStorage {
  constructor({ uploadDir }) {
    if (!isString(uploadDir)) {
      throw new Error(`Invalid uploadDir prop; expected string, received ${typeOf(uploadDir)}`);
    }

    this.props = {
      uploadDir,
    };
  }

  async writeFile(filename, data) {
    const { uploadDir } = this.props;
    const filepath = path.join(uploadDir, filename);
    return writeFileAsync(filepath, data);
  }

  async readFile(filename) {
    const { uploadDir } = this.props;
    const filepath = path.join(uploadDir, filename);
    return readFileAsync(filepath);
  }

  async removeFile(filename) {
    const { uploadDir } = this.props;
    const filepath = path.join(uploadDir, filename);
    return unlinkAsync(filepath);
  }
}

export default FileStorage;
