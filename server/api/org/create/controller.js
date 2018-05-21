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

  // make sure org does not already exist
  const count = await OrgModel.count({ slug: request.body.slug });

  if (count !== 0) {
    throw Boom.conflict(`Org "${request.body.slug}" already exists`);
  }

  // create org in db
  const org = await OrgModel.create(request.body);

  response.status = 201; // Created
  response.body = {
    id: org._id,
    name: org.name,
    slug: org.slug,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
  };
}

export default compose([validation, handler]);
