import compose from 'koa-compose';
import createAuthnMiddleware from '../../../middleware/authn';
import packJSONRPC from '../../../middleware/packJSONRPC';

const authn = createAuthnMiddleware();

async function handler({ request, response }) {
  response.status = 200; // OK
  response.body = {
    session: request.session,
  };
}

export default compose([packJSONRPC, authn, handler]);
