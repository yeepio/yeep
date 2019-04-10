import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { decorateSession, isUserAuthenticated } from '../../../middleware/auth';
import { generateTOTPSecret } from './service';

async function handler(ctx) {
  const { request, response } = ctx;
  const { user } = request.session;

  const { secret, qrcode } = await generateTOTPSecret(ctx, { userId: user.id });

  response.status = 200; // OK
  response.body = {
    secret,
    qrcode,
  };
}

export default compose([packJSONRPC, decorateSession(), isUserAuthenticated(), handler]);
