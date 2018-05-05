async function handler({ response }) {
  response.status = 200;
  response.body = { ping: 'pong' };
}

export default handler;
