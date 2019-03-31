import http from 'http';
import https from 'https';
import { format as formatUrl } from 'url';
import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import axios from 'axios';
import memoizeOne from 'memoize-one';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import { decorateSession, isUserAuthenticated } from '../../../middleware/auth';

const validationSchema = {
  body: {
    requests: Joi.array()
      .items(
        Joi.object()
          .unknown(false)
          .keys({
            method: Joi.string()
              .valid(['POST', 'GET'])
              .default('POST')
              .optional(),
            path: Joi.string()
              .uri({
                relativeOnly: true,
              })
              .trim()
              .min(2)
              .max(140)
              .regex(/\/api\/(org|user|permission|role|invitation)/, { name: 'path' })
              .required(),
            query: Joi.object()
              .default({})
              .optional(),
            body: Joi.object()
              .default({})
              .optional(),
            headers: Joi.object()
              .default({})
              .optional(),
          })
          .required()
      )
      .min(2)
      .max(20)
      .required(),
  },
};

const getClient = memoizeOne((baseURL) => {
  return axios.create({
    baseURL,
    httpAgent: new http.Agent({ keepAlive: true }),
    httpsAgent: new https.Agent({ keepAlive: true }),
  });
});

const handler = async (ctx) => {
  const { request, response, config } = ctx;
  const client = getClient(config.baseUrl);

  // process responses
  const responses = await Promise.all(
    request.body.requests.map((e) => {
      const tsStart = Date.now();
      return client
        .request({
          method: e.method.toLowerCase(),
          url: e.path,
          headers: {
            ...e.headers,
            Authorization: request.headers.authorization,
            'X-Forwarded-For': request.ip,
          },
          data: e.body,
          params: e.query,
          timeout: 3000, // 3 secs
        })
        .catch((err) => {
          const boom = err.message.includes('timeout')
            ? Boom.gatewayTimeout(err)
            : Boom.badGateway(err);
          const data = {
            ok: false,
            error: {
              code: boom.output.statusCode,
              message: boom.message,
              details: boom.output.payload.details,
            },
          };
          return { data };
        })
        .then(({ data }) => {
          data.ts = Date.now() - tsStart;
          return data;
        });
    })
  );

  response.status = 200;
  response.body = { responses };
};

export default compose([
  packJSONRPC,
  decorateSession(),
  isUserAuthenticated(),
  validateRequest(validationSchema),
  handler,
]);
