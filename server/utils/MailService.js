import nodemailer from 'nodemailer';
import EventEmitter from 'events';
import isString from 'lodash/isString';
import isPlainObject from 'lodash/isPlainObject';
import typeOf from 'typeof';

class MailService extends EventEmitter {
  constructor(props) {
    super();

    const { transport = 'debug', from = 'admin@yeep.com', options = {} } = props;
    const { auth, service, host } = options;

    switch (transport) {
      case 'debug': {
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
          close: () => {},
        };
        break;
      }
      case 'sendgrid': {
        const sgTransport = require('nodemailer-sendgrid-transport');
        this.transport = nodemailer.createTransport(sgTransport(options));
        break;
      }
      case 'ses': {
        const aws = require('aws-sdk');
        this.transport = nodemailer.createTransport({
          SES: new aws.SES(options),
        });
        break;
      }
      case 'mailgun': {
        if (!isPlainObject(auth)) {
          throw new TypeError(
            `Invalid "auth" argument; expected plain object, received ${typeOf(auth)}`
          );
        }
        const mgTransport = require('nodemailer-mailgun-transport');
        this.transport = nodemailer.createTransport(mgTransport(options));
        break;
      }
      case 'smtp': {
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
        break;
      }
      default: {
        throw new Error(
          `Non supported transport provided. Received ${transport}. Currently supported: ['sendgrid, ses, mailgun, smtp']`
        );
      }
    }

    this.props = {
      service,
      auth,
      from,
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
    return await transport.sendMail(mailOptions);
  }

  teardown() {
    this.transport.close();
  }
}

export default MailService;
