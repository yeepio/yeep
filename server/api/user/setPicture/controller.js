import Joi from 'joi';
// import Boom from 'boom';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { validateRequest } from '../../../middleware/validation';
import {
  visitSession,
  // isUserAuthenticated,
  // visitUserPermissions,
  // isUserAuthorized,
} from '../../../middleware/auth';
import { parseMultipartForm } from '../../../middleware/multipartForm';
import setUserPicture, { minImageSize, maxImageSize } from './service';

const validationSchema = {
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
    picture: Joi.object().required(),
    cropSize: Joi.number()
      .integer()
      .min(minImageSize)
      .max(maxImageSize)
      .optional(),
    cropX: Joi.number()
      .integer()
      .min(0)
      .default(0)
      .optional(),
    cropY: Joi.number()
      .integer()
      .min(0)
      .default(0)
      .optional(),
  },
};

async function handler({ request, response, db, storage }) {
  await setUserPicture(db, storage, request.body);
  response.status = 200; // OK
  response.body = request.body;
}

export default compose([
  packJSONRPC,
  visitSession(),
  // isUserAuthenticated(),
  parseMultipartForm(),
  validateRequest(validationSchema),
  // visitUserPermissions(),
  // isUserAuthorized({
  //   permissions: ['yeep.user.write'],
  //   org: (request) => {
  //     const { orgs } = request.body;
  //     return orgs.length === 1 ? orgs[0] : null;
  //   },
  // }),
  handler,
]);
