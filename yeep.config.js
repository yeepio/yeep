const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '.env'),
});

module.exports = {
  baseUrl: process.env.BASE_URL,
  port: 5000,
  jwt: {
    type: 'hmac',
    secret: process.env.JWT_SECRET,
  },
  mongo: {
    uri: process.env.MONGODB_URI,
    migrationDir: 'migrations/',
  },
  storage: {
    type: 'fs',
    uploadDir: 'uploads/',
  },
  mail: {
    transport: 'smtp',
    from: 'admin@yeep.com',
    // from: "'Custom Name' <myemail@address.com>",
    templatePath: 'server/views/passwordResetInit.html',
    options: {
      // service: 'Mailgun',
      // service: 'gmail',
      host: 'smtp.ethereal.email',
      port: 587,
      // host: 'YOUR-SES-SERVER-NAME',
      // port: 465,
      auth: {
        user: process.env.MAIL_AUTH_USERNAME,
        pass: process.env.MAIL_AUTH_PASSWORD,
      },
    },
  },
};
