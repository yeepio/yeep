import compose from 'koa-compose';
import Boom from 'boom';
import createAuthnMiddleware from '../../../middleware/authn';
import packJSONRPC from '../../../middleware/packJSONRPC';
import destroySession from './service';

const authn = createAuthnMiddleware();

async function handler({ db, request, response }) {
  const isSessionDestroyed = await destroySession(db, {
    id: request.session.token.id,
  });

  if (!isSessionDestroyed) {
    throw Boom.internal();
  }

  response.status = 200; // OK
}

export default compose([packJSONRPC, authn, handler]);
