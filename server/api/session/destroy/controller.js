import compose from 'koa-compose';
import Boom from 'boom';
import { visitSession, isUserAuthenticated } from '../../../middleware/auth';
import packJSONRPC from '../../../middleware/packJSONRPC';
import destroySessionToken from './service';

async function handler({ db, request, response }) {
  const isSessionDestroyed = await destroySessionToken(db, {
    id: request.session.token.id,
  });

  if (!isSessionDestroyed) {
    throw Boom.internal();
  }

  response.status = 200; // OK
}

export default compose([packJSONRPC, visitSession(), isUserAuthenticated(), handler]);
