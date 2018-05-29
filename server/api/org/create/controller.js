import Joi from 'joi';
import Boom from 'boom';
import compose from 'koa-compose';
import { createValidationMiddleware } from '../../../middleware/validation';

const validation = createValidationMiddleware({
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
});

async function handler({ request, response, db }) {
  const OrgModel = db.model('Org');

  // create org in db
  try {
    const org = await OrgModel.create(request.body);

    response.status = 201; // Created
    response.body = {
      org: {
        id: org._id,
        name: org.name,
        slug: org.slug,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
      },
    };
  } catch (err) {
    if (err.code === 11000) {
      throw Boom.conflict(`Org "${request.body.slug}" already in use`);
    }

    throw err;
  }
}

export default compose([validation, handler]);
