import { getOpenApi } from './service';

async function handler(ctx) {
  const apiDocs = await getOpenApi(ctx);
  const { response } = ctx;
  response.status = 200;
  response.body = apiDocs;
}

export default handler;
