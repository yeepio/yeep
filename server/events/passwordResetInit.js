import { readFile } from 'fs';
import path from 'path';
import flow from 'lodash/fp/flow';
import template from 'lodash/template';
import memoize from 'lodash/memoize';
import juice from 'juice';
import { promisify } from 'util';

let compileTemplate = memoize(
  flow(
    juice,
    template
  )
);
const readFileAsync = promisify(readFile);
let emailTemplateContent;
readFileAsync(path.resolve(__dirname, '../views/passwordResetInit.html'), {
  encoding: 'utf8',
}).then((response) => {
  emailTemplateContent = response;
});
const handler = ({ mail }, props) => {
  // const passwordResetTemplateFile = await readFileAsync(
  //   path.resolve(__dirname, '../views/passwordResetInit.html'),
  //   {
  //     encoding: 'utf8',
  //   }
  // );
  const template = compileTemplate(emailTemplateContent);
  const htmlTemplate = template({ url: 'https://example.com' });
  const message = {
    to: props.user.emailAddress,
    html: htmlTemplate,
  };
  mail.sendMail(message);
};

export default handler;
