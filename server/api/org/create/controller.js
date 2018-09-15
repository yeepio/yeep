import Joi from 'joi';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { createValidationMiddleware } from '../../../middleware/validation';
import {
  visitSession,
  isUserAuthenticated,
  visitUserPermissions,
  isUserAuthorized,
} from '../../../middleware/auth';
import createOrg from './service';

const authz = compose([
  visitUserPermissions(),
  isUserAuthorized({
    permissions: ['yeep.org.write'],
  }),
]);
const adaptiveAuthZ = async (ctx, next) => {
  const { settings } = ctx;
  const isOrgCreationOpen = await settings.get('isOrgCreationOpen');

  if (!isOrgCreationOpen) {
    return authz(ctx, next);
  }

  await next();
};

const validationSchema = {
  body: {
    name: Joi.string()
      .trim()
      .min(3)
      .max(100)
      .required(),
    slug: Joi.string()
      .lowercase()
      .trim()
      .min(3)
      .max(30)
      .required()
      .regex(/^[A-Za-z0-9\-_]*$/, { name: 'slug' }),
  },
};

async function handler({ request, response, db }) {
  const org = await createOrg(db, {
    ...request.body,
    adminId: request.session.user.id,
  });

  response.status = 200; // OK
  response.body = {
    org,
  };
}

export default compose([
  packJSONRPC,
  visitSession(),
  isUserAuthenticated(),
  createValidationMiddleware(validationSchema),
  adaptiveAuthZ,
  handler,
]);
