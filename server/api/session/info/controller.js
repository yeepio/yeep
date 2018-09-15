import compose from 'koa-compose';
import { visitSession, isUserAuthenticated } from '../../../middleware/auth';
import packJSONRPC from '../../../middleware/packJSONRPC';

async function handler({ request, response }) {
  response.status = 200; // OK
  response.body = {
    session: request.session,
  };
}

export default compose([packJSONRPC, visitSession(), isUserAuthenticated(), handler]);
