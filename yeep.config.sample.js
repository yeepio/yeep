module.exports = {
  // External public URL people use to access your Yeep installation.
  // Please note this defines the URI for all Yeep endpoints, such as `${baseUrl}/api/v1/ping`.
  // Feel free to specify port if necessary.
  // Trailing "/" is optional.
  baseUrl: 'https://your-domain.com',
  // Internal port the Yeep server listens to.
  // Please note this might be different to the port you use to access Yeep externally, i.e. in the case you're behind a reverse proxy (see Heroku, GAE, etc).
  port: 5000,
  // Yeep uses JWT to authenticate users.
  jwt: {
    // JWT type; one of "hmac".
    type: 'hmac',
    // secret to sign the JWT (keep it hidden, keep it safe).
    secret: 'please change this secret',
  },
  // Yeep uses mongo to store users, orgs, credentials, etc.
  mongo: {
    // MongoDB connection string URI.
    // @see https://docs.mongodb.com/manual/reference/connection-string/ for further info.
    uri: 'mongodb://localhost:27017/yeep',
    // Path to database migrations directory.
    // Do not change this unless you know what your are doing.
    migrationDir: './node_modules/yeep/migrations',
  },
  // Yeep stores files (e.g. user profile pictures) outside MongoDB.
  // The default storage is "fs" (i.e. local filesystem), but this won't work on ephemeral filesystem platforms (e.g. Heroku).
  storage: {
    type: 'fs',
    // The directory that files will be written to.
    // Please set the necessary permissions to make this writable by Yeep.
    uploadDir: 'uploads/',
  },
};
