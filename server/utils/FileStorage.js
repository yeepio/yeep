import fs from 'fs';
import { URL } from 'url';
import path from 'path';
import { promisify } from 'util';
import isString from 'lodash/isString';
import typeOf from 'typeof';

const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const unlinkAsync = promisify(fs.unlink);
const accessAsync = promisify(fs.access);

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

  resolve(filename) {
    const u = new URL(filename, this.props.baseUrl);
    return u.toString();
  }

  relative(url) {
    if (!url.startsWith(this.props.baseUrl)) {
      const err = new Error('The designated URL does not conform to storage schema');
      err.code = 'ERR_INVALID_URL';
      throw err;
    }
    const filename = url.slice(this.props.baseUrl.length);
    if (filename[0] === '/') {
      return filename.slice(1);
    }
    return filename;
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

  async existsFile(filename) {
    const { uploadDir } = this.props;
    const filepath = path.join(uploadDir, filename);
    try {
      await accessAsync(filepath);
      return true;
    } catch (err) {
      return false;
    }
  }

  async removeFile(filename) {
    const { uploadDir } = this.props;
    const filepath = path.join(uploadDir, filename);
    return unlinkAsync(filepath);
  }
}

export default FileStorage;
