import Boom from 'boom';

async function errorHandler(ctx, next) {
  try {
    await next();
  } catch (err) {
    // convert err to boom instance
    const boom = Boom.boomify(err);

    ctx.response.status = boom.output.statusCode;
    ctx.response.set(err.output.headers);
    ctx.response.body = boom.output.payload;

    // print unknown error stack to stderr
    if (boom.output.statusCode >= 500) {
      console.error(boom.stack);
    }
  }
}

export default errorHandler;
