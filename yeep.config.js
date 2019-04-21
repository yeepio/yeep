const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '.env'),
});

module.exports = {
  name: 'Yeep Dev',
  baseUrl: process.env.BASE_URL,
  port: 5000,
  accessToken: {
    type: 'hmac',
    secret: process.env.JWT_SECRET,
    lifetimeInSeconds: 300, // i.e. 5 mins
  },
  refreshToken: {
    lifetimeInSeconds: 3 * 24 * 60 * 60, // i.e. 3 days
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
    templates: {
      passwordReset: path.resolve(__dirname, 'server/views/passwordResetInit.html'),
      emailVerification: path.resolve(__dirname, 'server/views/emailVerification.html'),
      emailVerificationSuccess: path.resolve(
        __dirname,
        'server/views/emailVerificationSuccess.html'
      ),
      emailVerificationError: path.resolve(__dirname, 'server/views/emailVerificationError.html'),
    },
  },
  isUsernameEnabled: true,
  isOrgCreationOpen: true,
};
