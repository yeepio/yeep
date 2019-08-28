import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import { ObjectId } from 'mongodb';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  decorateSession,
  isUserAuthenticated,
  populateUserPermissions,
} from '../../../middleware/auth';
import { updateOrg } from './service';
import { AuthorizationError, OrgNotFoundError } from '../../../constants/errors';
import * as SortedUserPermissionArray from '../../../utils/SortedUserPermissionArray';

export const validationSchema = {
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
    name: Joi.string()
      .trim()
      .min(3)
      .max(100)
      .optional(),
    slug: Joi.string()
      .lowercase()
      .trim()
      .min(3)
      .max(30)
      .optional()
      .regex(/^[A-Za-z0-9\-_]*$/, { name: 'slug' }),
  },
};

async function applyAdditionalValidationLogic({ request }, next) {
  const { name, slug } = request.body;

  // ensure name or slug have been specified
  if (!(name || slug)) {
    const boom = Boom.badRequest('Invalid request body');
    boom.output.payload.details = [
      {
        path: ['name'],
        type: 'any.required',
      },
    ];
    throw boom;
  }

  await next();
}

async function ensureRequestedOrgExists({ request, db }, next) {
  const OrgModel = db.model('Org');

  const count = await OrgModel.countDocuments({
    _id: ObjectId(request.body.id),
  });

  if (count === 0) {
    throw new OrgNotFoundError(`Org ${request.body.id} cannot be found`);
  }

  await next();
}

async function isUserAuthorized({ request }, next) {
  const hasPermission = [request.body.id, null].some((orgId) =>
    SortedUserPermissionArray.includes(request.session.user.permissions, {
      name: 'yeep.org.write',
      orgId,
    })
  );

  if (!hasPermission) {
    throw new AuthorizationError(
      `User ${request.session.user.id} is not authorized to update org ${request.body.id}`
    );
  }

  await next();
}

async function handler(ctx) {
  const { request, response } = ctx;
  const { id, name, slug } = request.body;

  const org = await updateOrg(ctx, id, {
    name,
    slug,
  });

  response.status = 200; // OK
  response.body = {
    org,
  };
}

export default compose([
  packJSONRPC,
  decorateSession(),
  isUserAuthenticated(),
  validateRequest(validationSchema),
  applyAdditionalValidationLogic,
  populateUserPermissions,
  ensureRequestedOrgExists,
  isUserAuthorized,
  handler,
]);
