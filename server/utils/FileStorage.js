import fs from 'fs';
import url from 'url';
import path from 'path';
import { promisify } from 'util';
import isString from 'lodash/isString';
import typeOf from 'typeof';

const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const unlinkAsync = promisify(fs.unlink);

class FileStorage {
  constructor({ uploadDir, baseUrl }) {
    if (!isString(uploadDir)) {
      throw new Error(`Invalid uploadDir prop; expected string, received ${typeOf(uploadDir)}`);
    }

    if (!isString(baseUrl)) {
      throw new Error(`Invalid baseUrl prop; expected string, received ${typeOf(baseUrl)}`);
    }

    this.props = {
      uploadDir,
      baseUrl,
    };
  }

  resolveUrl(filename) {
    return url.resolve(this.props.baseUrl, filename);
  }

  async writeFile(filename, data) {
    const { uploadDir } = this.props;
    const filepath = path.join(uploadDir, filename);
    await writeFileAsync(filepath, data);
    return 'http';
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
