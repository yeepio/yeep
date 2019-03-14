import { getOpenApiDocs } from './service';

async function handler(ctx) {
  const apiDocs = await getOpenApiDocs(ctx);
  const { response } = ctx;
  response.status = 200;
  response.type = 'application/vnd.oai.openapi+json;version=3.0';
  response.body = apiDocs;
}

export default handler;
