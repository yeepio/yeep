// import fs from 'fs';
import nodemailer from 'nodemailer';
// import { promisify } from 'util';
import EventEmitter from 'events';
import isString from 'lodash/isString';
import isPlainObject from 'lodash/isPlainObject';
import typeOf from 'typeof';

// const writeFileAsync = promisify(fs.writeFile);
// const readFileAsync = promisify(fs.readFile);
// const unlinkAsync = promisify(fs.unlink);
// const accessAsync = promisify(fs.access);

class MailService extends EventEmitter {
  constructor(props) {
    super();

    if (!isPlainObject(props)) {
      throw new TypeError(
        `Invalid "props" argument; expected plain object, received ${typeOf(props)}`
      );
    }

    const { auth, service, host, from, templatePath } = props;
    // transport: 'SMTP',
    // from: 'myemail@address.com',
    // from2: "'Custom Name' <myemail@address.com>",
    // templatePath: 'server/views/passwordResetInit.html',
    // options: {
    //   service: 'Mailgun',
    //   host: 'YOUR-SES-SERVER-NAME',
    //   port: 465,
    //   auth: {
    //     user: 'postmaster@example.mailgun.org',
    //     pass: '1234567890',
    //   },
    // },
    if (!isPlainObject(auth)) {
      throw new TypeError(
        `Invalid "auth" argument; expected plain object, received ${typeOf(auth)}`
      );
    }
    if (!isString(service)) {
      throw new Error(`Invalid service prop; expected string, received ${typeOf(service)}`);
    }

    if (host && !isString(host)) {
      throw new Error(`Invalid host prop; expected string, received ${typeOf(host)}`);
    }

    if (from && !isString(from)) {
      throw new Error(`Invalid from prop; expected string, received ${typeOf(from)}`);
    }

    if (templatePath && !isString(templatePath)) {
      throw new Error(
        `Invalid templatePath prop; expected string, received ${typeOf(templatePath)}`
      );
    }

    // create reusable transport method (opens pool of SMTP connections)
    const transport = nodemailer.createTransport({ service, auth });

    this.props = {
      service,
      auth,
      transport,
      from,
      templatePath,
    };
  }

  connect() {
    const { service, auth } = this.props;
    this.transport = nodemailer.createTransport('SMTP', { service, auth });
  }

  async sendMail(receiver) {
    const { transport, from } = this.props;
    const mailOptions = {
      from,
      to: receiver,
      subject: 'Hello ✔',
      text: 'Hello world ✔',
      html: '<b>Hello world ✔</b>',
    };

    return await transport.sendMail(mailOptions);
  }

  teardown() {
    this.transport.close();
  }
}

export default MailService;
