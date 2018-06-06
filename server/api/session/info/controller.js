import compose from 'koa-compose';
import createAuthnMiddleware from '../../../middleware/authn';
import packJSONRPC from '../../../middleware/packJSONRPC';

const authn = createAuthnMiddleware();

async function handler({ request, response }) {
  console.log(request.session);
  response.status = 200; // OK
  response.body = request.session;
}

export default compose([packJSONRPC, authn, handler]);
