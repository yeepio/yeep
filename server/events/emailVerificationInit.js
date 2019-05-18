import compileHtmlTemplate from '../utils/compileHtmlTemplate';

const handler = ({ mail, config }, props) => {
  const template = compileHtmlTemplate(config.mail.templates.emailVerification);
  const htmlTemplate = template({
    url: `${config.baseUrl}/verify-email?token=${props.token.secret}`,
    expiresAt: new Date(props.token.expiresAt),
  });
  const message = {
    to: props.user.emailAddress,
    subject: 'Verify your email',
    html: htmlTemplate,
  };
  mail
    .sendMail(message)
    .catch((error) => console.error(`[Mail]: failed to send forgot-email with ${error}`));
};

export default handler;
