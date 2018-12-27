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

    const { transport, from, templatePath, options } = props;
    const { auth, service, host } = options;

    if (!isPlainObject(auth)) {
      throw new TypeError(
        `Invalid "auth" argument; expected plain object, received ${typeOf(auth)}`
      );
    }

    if (service && !isString(service)) {
      throw new Error(`Invalid service prop; expected string, received ${typeOf(service)}`);
    }

    if (host && !isString(host)) {
      throw new Error(`Invalid host prop; expected string, received ${typeOf(host)}`);
    }

    if (!host && !service) {
      throw new Error(`Expecting service or a host to be defined in the configuration`);
    }

    if (from && !isString(from)) {
      throw new Error(`Invalid from prop; expected string, received ${typeOf(from)}`);
    }

    if (templatePath && !isString(templatePath)) {
      throw new Error(
        `Invalid templatePath prop; expected string, received ${typeOf(templatePath)}`
      );
    }

    if (transport === 'debug') {
      this.transport = {
        sendMail: (message) => {
          return new Promise((resolve) => {
            console.log(`
              **Mail transport not configured; this is the email message that we would normally send**

              from: ${message.from}
              to: ${message.to}
              subject: ${message.subject}

              text: ${message.text}
              html: ${message.html}
            `);
            resolve();
          });
        },
      };
    } else {
      // TODO: create reusable transport method (opens pool of SMTP connections)
      this.transport = nodemailer.createTransport(options);
    }

    this.props = {
      service,
      auth,
      from,
      templatePath,
      transport,
    };
  }

  async sendMail(message) {
    const { transport } = this;
    const { from } = this.props;
    const mailOptions = {
      from,
      to: message.to,
      subject: message.subject || 'Hello ✔',
      text: message.text || 'Hello world ✔',
      html: message.html || '<b>Hello world ✔</b>',
    };

    return await transport.sendMail(mailOptions);
  }

  teardown() {
    this.transport.close();
  }
}

export default MailService;
