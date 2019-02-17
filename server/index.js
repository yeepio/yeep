import https from 'https';
import { format as formatUrl } from 'url';
import server from './server';
import config from '../yeep.config';

server
  .setup(config)
  .then(() => {
    server.listen(config.port);
    const address = server.address();
    const baseUrl = formatUrl({
      protocol: server instanceof https.Server ? 'https' : 'http',
      hostname: address.address,
      port: address.port,
    });
    console.log(`Server listening on ${baseUrl}`);
  })
  .catch((err) => {
    console.error(err);
  });
