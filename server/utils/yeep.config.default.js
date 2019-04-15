module.exports = {
  // External public URL to access your Yeep installation (required).
  // Please note this defines the URI for all Yeep endpoints, such as `${baseUrl}/api/ping`.
  // Feel free to specify port if necessary.
  // Trailing "/" is optional.
  baseUrl: 'https://your-domain.com',
  // Internal port the Yeep server listens to (required).
  // Please note this might be different to the port you use to access Yeep externally, i.e. in the case you're behind a reverse proxy (see Heroku, GAE, etc).
  port: 5000,
  // Yeep uses JWT to authenticate users (required).
  jwt: {
    // JWT type; one of "hmac" (required).
    type: 'hmac',
    // secret to sign the JWT (required).
    secret: 'please change this secret',
  },
  // MongoDB configuration (required).
  // Yeep uses MongoDB to store users, orgs, auth factors, etc.
  mongo: {
    // MongoDB connection string URI (required).
    // @see https://docs.mongodb.com/manual/reference/connection-string/ for further info.
    uri: 'mongodb://localhost:27017/yeep',
    // Path to database migrations directory (optional).
    // Do not change this unless you know what your are doing.
    migrationDir: '~yeep/migrations',
  },
  // Storage configuration (required).
  // Yeep stores files (e.g. user profile pictures) outside MongoDB.
  storage: {
    // Storage type; one of "fs" (required).
    // The default storage is "fs" (i.e. local filesystem), but this won't work on ephemeral filesystem platforms (e.g. Heroku).
    type: 'fs',
    // The directory that files will be written to (required).
    // Please set the necessary permissions to make this writable by Yeep.
    uploadDir: 'uploads/',
  },
  // Mail configuration (required).
  // Yeep uses nodemailer to send e-mail messages to users, e.g. facilitate reset-password process.
  mail: {
    // Transport type; one of "debug", "smtp", "ses", "mailgun", "sendgrid" (required).
    // The "debug" transport prints all messages to stdout without sending any actual e-mails. It's meant for debugging purposes only.
    transport: 'debug',
    // Email address of the sender (required).
    // You may also use the format "'Custom Name' <myemail@address.com>".
    from: 'noreply@your-domain.com',
    // Nodemailer transport options (optional).
    // Options specified here will be passed as arguments to nodemailer createTransport().
    options: {},
    // E-mail template paths (optional)
    templates: {
      passwordReset: '~yeep/views/passwordResetInit.html',
    },
  },
  // Example mail configuration for SMTP:
  // mail: {
  //   transport: 'smtp',
  //   from: 'admin@yeep.com',
  //   options: {
  //     host: 'smtp.ethereal.email',
  //     port: 587,
  //     auth: {
  //       user: 'user',
  //       pass: 'password',
  //     },
  //   },
  // },
  // Example mail configuration for Amazon SES:
  // mail: {
  //   transport: 'ses',
  //   from: 'admin@yeep.com',
  //   options: {
  //     apiVersion: '2010-12-01',
  //     accessKeyId: 'Your-Access-key',
  //     secretAccessKey: 'Your-Access-secret-key',
  //     region: 'your-region',
  //   },
  // },
  // Example mail configuration for Mailgun:
  // mail: {
  //   transport: 'mailgun',
  //   from: 'admin@yeep.com',
  //   options: {
  //     auth: {
  //       api_key: 'key-1234123412341234',
  //       domain: 'sandbox3249234.mailgun.org',
  //     },
  //   },
  // },
  // Example mail configuration for Sendgrid:
  // mail: {
  //   transport: 'sendgrid',
  //   from: 'admin@yeep.com',
  //   options: {
  //     auth: {
  //       api_key: 'your-api-key',
  //     },
  //   },
  // },
};
