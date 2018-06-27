import Joi from 'joi';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { createValidationMiddleware } from '../../../middleware/validation';
import getPermissionInfo from './service';

const validation = createValidationMiddleware({
  body: {
    id: Joi.string()
      .length(24)
      .hex()
      .required(),
  },
});

async function handler({ request, response, db }) {
  const permission = await getPermissionInfo(db, request.body);

  response.status = 200; // OK
  response.body = {
    permission,
  };
}

export default compose([packJSONRPC, validation, handler]);
