import Joi from 'joi';
import compose from 'koa-compose';
import { validateRequest } from '../../../middleware/validation';
import compileHtmlTemplate from '../../../utils/compileHtmlTemplate';
import emailVerify from '../../../api/email/verify/service';

export const validationSchema = {
  query: {
    token: Joi.string()
      .trim()
      .min(6)
      .max(100)
      .required()
      .regex(/^[A-Za-z0-9-]*$/, { name: 'token' }),
  },
};

const validateHtmlRequest = async (ctx, next) => {
  const { response, config } = ctx;
  try {
    await validateRequest(validationSchema)(ctx, next);
  } catch (e) {
    const template = compileHtmlTemplate(config.htmlTemplates.emailVerificationError);
    const htmlTemplate = template({
      reason: 'Missing or invalid token',
    });

    response.status = 200; // OK
    response.type = 'html';
    response.body = htmlTemplate;
    return response.body;
  }
};

async function handler(ctx) {
  const { request, response, config } = ctx;
  let htmlTemplate;
  // handle errors thrown by returning HTML instead of JSON
  try {
    await emailVerify(ctx, request.query);
    const template = compileHtmlTemplate(config.htmlTemplates.emailVerificationSuccess);
    htmlTemplate = template({
      url: config.baseUrl,
    });
  } catch (e) {
    const template = compileHtmlTemplate(config.htmlTemplates.emailVerificationError);
    htmlTemplate = template({
      reason: e.message,
    });
  }

  response.status = 200; // OK
  response.type = 'html';
  response.body = htmlTemplate;
}

export default compose([validateHtmlRequest, handler]);
