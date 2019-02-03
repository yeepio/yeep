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
    templates: {
      passwordReset: path.resolve(__dirname, 'server/views/passwordResetInit.html'),
    },
  },
  isUsernameEnabled: true,
  isOrgCreationOpen: true,
};
