import path from 'path';
import http from 'http';
import url from 'url';
import EventEmitter from 'events';
import Koa from 'koa';
import cors from '@koa/cors';
import enforceHttps, { xForwardedProtoResolver } from 'koa-sslify';
import helmet from 'koa-helmet';
import bodyParser from 'koa-bodyparser';
import compression from 'compression';
import koaConnect from 'koa-connect';
import cookie from 'koa-cookie';
import Boom from 'boom';
import mongoose from 'mongoose';
import serveStatic from 'koa-static';
import mount from 'koa-mount';
import { registerModels } from './models';
import JsonWebToken from './utils/JsonWebToken';
import FileStorage from './utils/FileStorage';
import MailService from './utils/MailService';
import errorHandler from './middleware/errorHandler';
import publicRoutes from './public';
import api from './api';
import events from './events';

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
      resolver: xForwardedProtoResolver, // trust x-forwarded-proto header
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

// parse cookies
app.use(cookie());

// register router
app.use(api.routes());
app.use(publicRoutes.routes());
app.use(
  api.allowedMethods({
    throw: true,
    notImplemented: () => Boom.notImplemented(),
    methodNotAllowed: () => Boom.methodNotAllowed(),
  })
);

// serve static admin_ui files
if (process.env.NODE_ENV === 'production') {
  app.use(mount('/admin', serveStatic(path.resolve(__dirname, '../admin_ui'))));
}

server.teardown = async () => {
  const { db, bus, mail } = app.context;

  // remove event handlers
  bus.removeAllListeners();

  mail.teardown();

  // disconnect from mongodb
  await db.close();
};

server.setup = async (config) => {
  // create message bus
  const bus = new EventEmitter();

  // create mongodb connection
  const db = await mongoose.createConnection(config.mongo.uri, {
    useNewUrlParser: true,
    useFindAndModify: false,
    autoIndex: false,
    bufferCommands: false,
    ignoreUndefined: true,
  });

  // register mongodb models
  registerModels(db);

  // setup storage layer
  const storage = new FileStorage({
    uploadDir: path.isAbsolute(config.storage.uploadDir)
      ? config.storage.uploadDir
      : path.resolve(config.storage.uploadDir),
    baseUrl: url.resolve(config.baseUrl, '/media/'),
  });

  // configure JWT
  const jwt = new JsonWebToken({
    secretKey: config.accessToken.secret,
    issuer: 'Yeep',
  });

  const mail = new MailService({
    ...config.mail,
  });

  // populate app context
  app.context.config = config;
  app.context.bus = bus;
  app.context.db = db;
  app.context.jwt = jwt;
  app.context.storage = storage;
  app.context.mail = mail;
  app.context.router = api; // expose router to enable dynamic API docs

  // register event handlers
  Object.entries(events).map(([eventKey, handler]) => {
    bus.on(eventKey, (props) => handler(app.context, props));
  });
};

server.getAppContext = () => {
  return app.context;
};

export default server;
