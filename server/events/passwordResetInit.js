import { readFileSync } from 'fs';
import path from 'path';
import flow from 'lodash/fp/flow';
import template from 'lodash/template';
import memoize from 'lodash/memoize';
import juice from 'juice';
import config from '../../yeep.config';

const baseUrl = config.baseUrl;
const defaultViewPath = path.resolve(__dirname, '../views/');
const templatePath =
  config.mail && config.mail.templatePath
    ? path.resolve(config.mail.templatePath)
    : defaultViewPath;
const emailTemplateContent = readFileSync(`${templatePath}/passwordResetInit.html`, 'utf8');
const emailTemplate = memoize(
  flow(
    juice,
    template
  )
)(emailTemplateContent);
const handler = ({ mail }, props) => {
  const htmlTemplate = emailTemplate({ url: `${baseUrl}/forgot-password` });
  const message = {
    to: props.user.emailAddress,
    html: htmlTemplate,
  };
  mail
    .sendMail(message)
    .catch((error) => console.error(`[Mail]: failed to send forgot-email with ${error}`));
};

export default handler;
