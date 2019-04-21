import Joi from 'joi';
import compose from 'koa-compose';
import compileHtmlTemplate from '../../utils/compileHtmlTemplate';
import emailVerify from '../../api/email/verify/service';

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

const validateRequest = async (ctx, next) => {
  const { request, response, config } = ctx;
  const { error } = Joi.validate(request.query, validationSchema.query, {
    allowUnknown: true,
    abortEarly: false, // returns all errors found
  });

  if (error) {
    const template = compileHtmlTemplate(config.mail.templates.emailVerificationError);
    const htmlTemplate = template({
      reason: 'Missing or invalid token',
    });

    response.status = 200; // OK
    response.type = 'html';
    response.body = htmlTemplate;
    return response.body;
  }

  await next();
};

async function handler(ctx) {
  const { request, response, config } = ctx;
  let htmlTemplate;
  // handle errors thrown by returning HTML instead of JSON
  try {
    await emailVerify(ctx, request.query);
    const template = compileHtmlTemplate(config.mail.templates.emailVerificationSuccess);
    htmlTemplate = template({
      url: config.baseUrl,
    });
  } catch (e) {
    const template = compileHtmlTemplate(config.mail.templates.emailVerificationError);
    htmlTemplate = template({
      reason: e.message,
    });
  }

  response.status = 200; // OK
  response.type = 'html';
  response.body = htmlTemplate;
}

export default compose([validateRequest, handler]);
