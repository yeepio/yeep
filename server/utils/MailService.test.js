/* eslint-env jest */
import MailService from './MailService';
import config from '../../yeep.config';

describe('MailService', () => {
  let mailService;

  beforeAll(async () => {
    mailService = new MailService({
      ...config.mail,
    });
  });

  afterAll(async () => {
    mailService.disconnect();
  });

  describe('sendMail', () => {
    test('sends email', async () => {
      await mailService.sendMail({
        to: 'spidey_nr@hotmail.com',
      });
    });
  });
});
