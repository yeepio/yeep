import http from 'http';
import { format as formatUrl } from 'url';
import Koa from 'koa';
import Boom from 'boom';
import api from './api';

const PORT = parseInt(process.env.PORT, 10) || 5000;

const app = new Koa();
const server = http.createServer(app.callback());

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
};

export default server;
