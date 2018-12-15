/* eslint-env jest */
import MailService from './MailService';
import config from '../../yeep.config';

describe('MailService', () => {
  let mailService;

  beforeAll(async () => {
    mailService = new MailService({
      service: config.mail.options.service,
      auth: config.mail.options.auth,
    });
  });

  afterAll(async () => {
    mailService.disconnect();
  });

  describe('sendMail', () => {
    test('sends email', async () => {
      mailService.sendMail('spidey_nr@hotmail.com');
    });
  });
});
