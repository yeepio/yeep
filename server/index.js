import https from 'https';
import { format as formatUrl } from 'url';
import server from './server';

const PORT = parseInt(process.env.PORT, 10) || 5000;

server
  .setup()
  .then(() => {
    server.listen(PORT);
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
