import path from 'path';
import http from 'http';
import url from 'url';
import EventEmitter from 'events';
import Koa from 'koa';
import cors from '@koa/cors';
import enforceHttps from 'koa-sslify';
import helmet from 'koa-helmet';
import bodyParser from 'koa-bodyparser';
import compression from 'compression';
import koaConnect from 'koa-connect';
import Boom from 'boom';
import mongoose from 'mongoose';
import createNextApp from 'next';
import * as models from './models';
import JsonWebToken from './utils/JsonWebToken';
import SettingsStore from './utils/SettingsStore';
import FileStorage from './utils/FileStorage';
import MailService from './utils/MailService';
import errorHandler from './middleware/errorHandler';
import api from './api';
import events from './events';

const app = new Koa();
const server = http.createServer(app.callback());
const next = createNextApp({
  dev: process.env.NODE_ENV !== 'production',
  dir: path.resolve(__dirname, '../admin_ui'),
});

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

// handle errors
app.use(errorHandler);

// setup cors
app.use(
  cors({
    origin: (ctx) => {
      const origin = ctx.get('Origin');
      if (origin.endsWith('.yeep.io') || process.env.NODE_ENV !== 'production') {
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

// pass other (*) requests to next handler
const handle = next.getRequestHandler();
api.get('*', async (ctx) => {
  await handle(ctx.req, ctx.res);
  ctx.respond = false;
});

server.teardown = async () => {
  const { db, settings, bus } = app.context;

  // stop next app
  if (process.env.NODE_ENV !== 'test') {
    await next.close();
  }

  // remove event handlers
  bus.removeAllListeners();

  // close setting store
  await settings.teardown();

  // disconnect from mongodb
  await db.close();
};

server.setup = async (config) => {
  // create message bus
  const bus = new EventEmitter();

  // connect to mongodb + register models
  const db = await mongoose.createConnection(config.mongo.uri, {
    useNewUrlParser: true,
    useFindAndModify: false,
    autoIndex: false,
    bufferCommands: false,
    ignoreUndefined: true,
  });

  Object.entries(models).forEach(([key, schema]) => {
    db.model(key, schema);
  });

  // setup storage layer
  const storage = new FileStorage({
    uploadDir: path.isAbsolute(config.storage.uploadDir)
      ? config.storage.uploadDir
      : path.resolve(config.storage.uploadDir),
    baseUrl: url.resolve(config.baseUrl, '/media/'),
  });

  // configure JWT
  const jwt = new JsonWebToken({
    secretKey: config.jwt.secret,
    issuer: 'Yeep',
  });

  const mail = new MailService({
    options: config.mail,
  });

  // setup settings store
  const settings = new SettingsStore(db);
  await settings.setup();

  // prepare next app
  if (process.env.NODE_ENV !== 'test') {
    await next.prepare();
  }

  // populate app context
  app.context.settings = settings;
  app.context.bus = bus;
  app.context.db = db;
  app.context.jwt = jwt;
  app.context.storage = storage;
  app.context.mail = mail;

  // register event handlers
  Object.entries(events, ([eventKey, handler]) => {
    bus.on(eventKey, (props) => handler(app.context, props));
  });
};

server.getAppContext = () => {
  return app.context;
};

export default server;
