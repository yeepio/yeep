import path from 'path';
import globby from 'globby';

const idps = {};

const matches = globby.sync(['*.js', '!index.js'], {
  cwd: __dirname,
});

matches.forEach((e) => {
  const idp = require(path.resolve(__dirname, e));
  const key = path.basename(e, '.js');
  idps[key] = idp.default || idp;
});

export default idps;
