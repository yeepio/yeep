import flow from 'lodash/fp/flow';
import template from 'lodash/template';
import memoize from 'lodash/memoize';
import juice from 'juice';

let compileTemplate = memoize(
  flow(
    juice,
    template
  )
);

const handler = ({ settings }, props) => {
  const template = compileTemplate(settings.get('passwordResetEmailTemplate'));
  console.log(template(props));
};

export default handler;
