import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import { createValidationMiddleware } from '../../../middleware/validation';

const validation = createValidationMiddleware({
  body: {
    slug: Joi.string()
      .lowercase()
      .trim()
      .min(3)
      .max(30)
      .required()
      .regex(/^[A-Za-z0-9\-_]*$/, { name: 'slug' }),
  },
});

async function handler({ request, response, db }) {
  const OrgModel = db.model('Org');

  const result = await OrgModel.deleteOne({ slug: request.body.slug });

  if (!result.ok) throw Boom.internal();

  response.status = 204; // No Content
}

export default compose([validation, handler]);
