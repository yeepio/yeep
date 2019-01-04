/* eslint-env jest */
import MailService from './MailService';

describe('MailService', () => {
  let mailService;

  beforeAll(async () => {
    mailService = new MailService({
      transport: 'debug',
      from: 'test@yeep.com',
    });
  });

  afterAll(async () => {
    mailService.teardown();
  });

  describe('sendMail', () => {
    test('sends email', async () => {
      expect.assertions(1);
      return expect(
        mailService.sendMail({
          to: 'test@hotmail.com',
        })
      ).resolves.toBe(undefined);
    });
  });
});
