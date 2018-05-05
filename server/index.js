import server from './server';

server
  .start()
  .then((info) => {
    console.log(`Server listening on ${info.url}`);
  })
  .catch((err) => {
    console.error(err);
  });
