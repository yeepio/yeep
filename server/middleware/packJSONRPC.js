import Boom from 'boom';

async function packJSONRPC(ctx, next) {
  try {
    await next();
    ctx.response.body = {
      ...ctx.response.body,
      ok: true,
    };
  } catch (err) {
    ctx.response.status = 200;

    // check if err is boom instance
    if (Boom.isBoom(err)) {
      ctx.response.body = {
        ok: false,
        error: {
          code: err.output.statusCode,
          message: err.message,
          details: err.output.payload.details,
        },
      };
      return;
    }

    // check if err is Yeep Error instance
    if (err.code) {
      ctx.response.body = {
        ok: false,
        error: {
          code: err.code,
          message: err.message,
        },
      };
      return;
    }

    // handle unexpected runtime errors
    console.error(err);
    const boom = Boom.badImplementation(err.message);
    ctx.response.body = {
      ok: false,
      error: {
        code: boom.output.statusCode,
        message: boom.message,
        details: boom.output.payload.details,
      },
    };
  }
}

export default packJSONRPC;
