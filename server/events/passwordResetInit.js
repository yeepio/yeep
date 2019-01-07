import { readFileSync } from 'fs';
import path from 'path';
import compileEmailTemplate from '../utils/compileEmailTemplate';
import config from '../../yeep.config';

const baseUrl = config.baseUrl;
const defaultViewPath = path.resolve(__dirname, '../views/passwordResetInit.html');
const templatePath =
  config.mail && config.mail.templates && config.mail.templates.passwordReset
    ? path.resolve(config.mail.templates.passwordReset)
    : defaultViewPath;

const emailTemplate = compileEmailTemplate(readFileSync(templatePath, 'utf8'));
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
