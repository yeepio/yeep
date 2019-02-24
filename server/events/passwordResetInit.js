import compileEmailTemplate from '../utils/compileEmailTemplate';

const handler = ({ mail, config }, props) => {
  const template = compileEmailTemplate(config.mail.templates.passwordReset);
  const htmlTemplate = template({ url: `${config.baseUrl}/forgot-password` });
  const message = {
    to: props.user.emailAddress,
    html: htmlTemplate,
  };
  mail
    .sendMail(message)
    .catch((error) => console.error(`[Mail]: failed to send forgot-email with ${error}`));
};

export default handler;
