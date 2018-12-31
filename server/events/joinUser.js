// import flow from 'lodash/fp/flow';
// import template from 'lodash/template';
// import memoize from 'lodash/memoize';
// import juice from 'juice';

// let compileTemplate = memoize(
//   flow(
//     juice,
//     template
//   )
// );

const handler = (ctx, props) => {
  console.log(props);
  // const template = compileTemplate(settings.get('passwordResetInitEmailTemplate'));
  // console.log(template(props));
};

export default handler;
