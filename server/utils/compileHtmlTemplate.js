import { readFileSync } from 'fs';
import memoize from 'lodash/memoize';
import flow from 'lodash/fp/flow';
import template from 'lodash/template';
import partialRight from 'lodash/partialRight';
import juice from 'juice';

const compileHtmlTemplate = memoize(
  flow(
    partialRight(readFileSync, 'utf8'),
    juice,
    template
  )
);

export default compileHtmlTemplate;
