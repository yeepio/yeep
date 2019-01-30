import { readFileSync } from 'fs';
import memoize from 'lodash/memoize';
import flow from 'lodash/fp/flow';
import template from 'lodash/template';
import juice from 'juice';

const readFile = (path) => readFileSync(path, 'utf8');
const compileEmailTemplate = memoize(
  flow(
    readFile,
    juice,
    template
  )
);

export default compileEmailTemplate;
