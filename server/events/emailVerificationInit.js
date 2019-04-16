import compileEmailTemplate from '../utils/compileEmailTemplate';

const handler = ({ mail, config }, props) => {
  const template = compileEmailTemplate(config.mail.templates.emailVerification);
  const htmlTemplate = template({
    url: `${config.baseUrl}/api/email/verify?token=${props.token.secret}`,
    expiresAt: new Date(props.token.expiresAt),
  });
  const message = {
    to: props.user.emailAddress,
    html: htmlTemplate,
  };
  mail
    .sendMail(message)
    .catch((error) => console.error(`[Mail]: failed to send forgot-email with ${error}`));
};

export default handler;
