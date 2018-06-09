import Joi from 'joi';
import compose from 'koa-compose';
import packJSONRPC from '../../../middleware/packJSONRPC';
import { createValidationMiddleware } from '../../../middleware/validation';
import { DuplicateOrgError } from '../../../constants/errors';

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

    response.status = 200; // OK
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
      throw new DuplicateOrgError(`Org "${request.body.slug}" already exists`);
    }

    throw err;
  }
}

export default compose([packJSONRPC, validation, handler]);
