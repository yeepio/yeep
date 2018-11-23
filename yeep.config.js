require('dotenv').config();

module.exports = {
  baseUrl: process.env.BASE_URL,
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
};
