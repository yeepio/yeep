import http from 'http';
import Koa from 'koa';
import cors from '@koa/cors';
import enforceHttps from 'koa-sslify';
import helmet from 'koa-helmet';
import bodyParser from 'koa-bodyparser';
import compression from 'compression';
import koaConnect from 'koa-connect';
import Boom from 'boom';
import mongoose from 'mongoose';
import * as models from './models';

import errorHandler from './middleware/errorHandler';
import api from './api';

const app = new Koa();
const server = http.createServer(app.callback());

// check if in production mode
if (process.env.NODE_ENV === 'production') {
  // trust proxy
  app.proxy = true;
  // enable security headers
  app.use(helmet());
  // enforce HTTPS
  app.use(
    enforceHttps({
      trustProtoHeader: true, // trust x-forwarded-proto header
    })
  );
  // enable gzip compression
  app.use(koaConnect(compression()));
}

// check if in development mode
if (process.env.NODE_ENV === 'development') {
  mongoose.set('debug', true);
}

// handle errors
app.use(errorHandler);

// setup cors
app.use(
  cors({
    origin: (ctx) => {
      const origin = ctx.get('Origin');
      if (
        origin.endsWith('.yeep.io') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return origin;
      }

      return null;
    },
  })
);

// parse application/json
app.use(
  bodyParser({
    enableTypes: ['json'],
    onerror: (err) => {
      throw Boom.badRequest(err);
    },
  })
);

// register router
app.use(api.routes());
app.use(
  api.allowedMethods({
    throw: true,
    notImplemented: () => Boom.notImplemented(),
    methodNotAllowed: () => Boom.methodNotAllowed(),
  })
);

server.teardown = async () => {
  // disconnect from mongodb
  const { db } = app.context;
  await db.close();
};

server.setup = async () => {
  // connect to mongodb + register models
  const db = await mongoose.createConnection(process.env.MONGODB_URI, {
    autoIndex: false,
    bufferCommands: false,
  });
  Object.entries(models).forEach(([key, schema]) => {
    db.model(key, schema);
  });
  app.context.db = db;
};

export default server;
