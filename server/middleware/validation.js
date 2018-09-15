import Boom from 'boom';
import Joi from 'joi';
import has from 'lodash/has';

function validateRequest(schema, opts = {}) {
  return async function({ request }, next) {
    // validate headers
    if (has(schema, 'headers')) {
      const { error, value } = Joi.validate(request.headers, schema.headers);

      if (error) {
        const boom = Boom.badRequest('Invalid request header(s)');
        boom.output.payload.details = error.details;

        throw boom;
      }

      request.headers = value;
    }

    // validate URL params
    if (has(schema, 'params')) {
      const { error, value } = Joi.validate(request.params, schema.params, {
        allowUnknown: true,
      });

      if (error) {
        const boom = Boom.badRequest('Invalid request URL param(s)');
        boom.output.payload.details = error.details;

        throw boom;
      }

      request.params = value;
    }

    // validate query params
    if (has(schema, 'query')) {
      const { error, value } = Joi.validate(request.query, schema.query, {
        allowUnknown: opts.allowUnknown === true,
        abortEarly: false, // returns all errors found
      });

      if (error) {
        const boom = Boom.badRequest('Invalid request query param(s)');
        boom.output.payload.details = error.details;

        throw boom;
      }

      // ugly koa hack follows; unfortunatelly there is currently no better way to overwrite request.query with Koa
      // using `request.query = value;` serializes and de-serializes the query resulting to converted values (e.g. integers) being reset to strings
      request._querycache[request.querystring] = value; // eslint-disable-line
    }

    // validate body
    if (has(schema, 'body')) {
      const { error, value } = Joi.validate(request.body, schema.body, {
        abortEarly: false, // returns all errors found
      });

      if (error) {
        const boom = Boom.badRequest('Invalid request body');
        boom.output.payload.details = error.details;

        throw boom;
      }

      request.body = value;
    }

    await next();
  };
}

export { validateRequest };
