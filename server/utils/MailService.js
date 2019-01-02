import nodemailer from 'nodemailer';
import path from 'path';
import EventEmitter from 'events';
import isString from 'lodash/isString';
import isPlainObject from 'lodash/isPlainObject';
import typeOf from 'typeof';

class MailService extends EventEmitter {
  constructor(props) {
    super();

    if (!isPlainObject(props)) {
      throw new TypeError(
        `Invalid "props" argument; expected plain object, received ${typeOf(props)}`
      );
    }

    const {
      transport,
      from = 'admin@yeep.com',
      templatePath = path.resolve(__dirname, '../views/'),
      options,
    } = props;
    const { auth, service, host } = options;

    if (from && !isString(from)) {
      throw new Error(`Invalid from prop; expected string, received ${typeOf(from)}`);
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
    } else if (transport === 'sendgrid') {
      const sgTransport = require('nodemailer-sendgrid-transport');
      this.transport = nodemailer.createTransport(sgTransport(options));
    } else if (transport === 'ses') {
      const aws = require('aws-sdk');
      this.transport = nodemailer.createTransport({
        SES: new aws.SES(options),
      });
    } else if (transport === 'mailgun') {
      if (!isPlainObject(auth)) {
        throw new TypeError(
          `Invalid "auth" argument; expected plain object, received ${typeOf(auth)}`
        );
      }
      const mgTransport = require('nodemailer-mailgun-transport');
      this.transport = nodemailer.createTransport(mgTransport(options));
    } else {
      if (host && !isString(host)) {
        throw new Error(`Invalid host prop; expected string, received ${typeOf(host)}`);
      }
      if (!isPlainObject(auth)) {
        throw new TypeError(
          `Invalid "auth" argument; expected plain object, received ${typeOf(auth)}`
        );
      }
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
      subject: message.subject,
      text: message.text,
      html: message.html,
    };
    transport.sendMail(mailOptions, (err, res) => console.log(err, res));
  }

  teardown() {
    this.transport.close();
  }
}

export default MailService;
