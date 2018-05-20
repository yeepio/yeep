import http from 'http';
import { format as formatUrl } from 'url';
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

const PORT = parseInt(process.env.PORT, 10) || 5000;

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

/**
 * Starts the server.
 */
server.start = async () => {
  // check if server is already listening
  if (server.listening) {
    throw new Error('Server already listening');
  }

  // connect to mongodb + register models
  const db = await mongoose.createConnection();
  Object.entries(models).forEach(([key, schema]) => {
    db.model(key, schema);
  });
  app.context.db = db;

  // start the server
  await new Promise((resolve, reject) => {
    server.listen(PORT, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

  // return server base URL
  const address = server.address();
  return {
    url: formatUrl({
      protocol: 'http:',
      hostname: address.address,
      port: address.port,
    }),
  };
};

/**
 * Stops the HTTP server.
 */
server.stop = async () => {
  // check if server is already stopped
  if (!server.listening) {
    return; // exit
  }

  // stop the server
  await new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

  // disconnect from mongodb
  const { db } = app.context;
  await db.close();
};

export default server;
