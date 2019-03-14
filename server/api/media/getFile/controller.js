import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import mime from 'mime';
import { validateRequest } from '../../../middleware/validation';
import { visitSession } from '../../../middleware/auth';

export const validationSchema = {
  params: {
    filename: Joi.string()
      .trim()
      .min(1)
      .max(200)
      .required(),
  },
};

async function handler({ request, response, storage }) {
  let file;

  try {
    file = await storage.readFile(request.params.filename);
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw Boom.notFound();
    }
    throw err;
  }

  response.status = 200; // OK
  response.type = mime.getType(request.params.filename);
  response.body = file;
}

export default compose([visitSession(), validateRequest(validationSchema), handler]);
