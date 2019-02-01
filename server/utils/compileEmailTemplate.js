import flow from 'lodash/fp/flow';
import template from 'lodash/template';
import juice from 'juice';

const compileEmailTemplate = flow(
  juice,
  template
);

export default compileEmailTemplate;
