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

    ctx.response.body = {
      ok: false,
      error: {
        code: err.code || 0,
        message: err.message,
      },
    };
  }
}

export default packJSONRPC;
