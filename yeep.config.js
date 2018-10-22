module.exports = {
  baseUrl: 'http://localhost:5000/',
  jwt: {
    type: 'hmac',
    secret: 'keep it safe, keep it hidden!',
  },
  database: {
    mongo: {
      uri: 'mongodb://localhost:27017/yeep',
    },
  },
  storage: {
    type: 'fs',
    uploadDir: 'uploads/',
  },
};
