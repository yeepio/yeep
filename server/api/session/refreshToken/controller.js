import Joi from 'joi';
import compose from 'koa-compose';
import { validateRequest } from '../../../middleware/validation';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { refreshSession, verifyBearerJWT, deriveProjection } from './service';
import { signBearerJWT } from '../issueToken/service';
import jwt from '../../../utils/jwt';

export const validationSchema = {
  body: {
    token: Joi.string()
      .trim()
      .min(100)
      .max(10000)
      // .regex(/^[A-Za-z0-9\\.\\-]*$/, { name: 'accessToken' }),
      .required(),
  },
};

async function handler(ctx) {
  const { request, response } = ctx;

  const payload = await verifyBearerJWT(ctx, request.body);
  const session = await refreshSession(ctx, {
    secret: payload.jti,
    userId: payload.user.id,
    projection: deriveProjection(payload),
  });
  const token = await signBearerJWT(ctx, session);
  const decoded = jwt.decode(token);

  response.status = 200; // OK
  response.body = {
    token,
    expiresAt: new Date(decoded.exp * 1000),
  };
}

export default compose([packJSONRPC, validateRequest(validationSchema), handler]);
