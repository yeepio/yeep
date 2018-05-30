import Joi from 'joi';
// import Boom from 'boom';
import compose from 'koa-compose';
import addSeconds from 'date-fns/add_seconds';
import { createValidationMiddleware } from '../../../middleware/validation';
import {
  UserNotFoundError,
  InvalidCredentialsError,
} from '../../../constants/errors';

const validation = createValidationMiddleware({
  body: {
    username: Joi.string()
      .lowercase()
      .trim()
      .min(2)
      .max(30)
      .required()
      .regex(/^[A-Za-z0-9_\-.]*$/, { name: 'username' }),
    password: Joi.string()
      .trim()
      .min(8)
      .max(50)
      .required(),
  },
});

async function handler({ request, response, db, jwt }) {
  const UserModel = db.model('User');

  // retrieve user from db
  const user = await UserModel.findOne({
    username: request.body.username,
  });

  // make sure user exists
  if (!user) {
    throw new UserNotFoundError(`User "${request.body.username}" not found`);
  }

  // verify password
  const digestedPassword = await UserModel.digestPassword(
    request.body.password,
    user.salt,
    user.iterationCount
  );

  if (user.password.compare(digestedPassword) !== 0) {
    throw new InvalidCredentialsError(
      'Invalid username or password credentials'
    );
  }

  // set expiration time
  const expiresIn = 7 * 24 * 60 * 60; // 7 days (in seconds)

  // create authentication token
  const TokenModel = db.model('Token');
  const token = await TokenModel.create({
    secret: TokenModel.generateSecret({ length: 24 }),
    type: 'AUTHENTICATION',
    payload: {},
    userId: user._id,
    expiresAt: addSeconds(new Date(), expiresIn),
  });

  // generate JWT token
  const jwtToken = await jwt.sign(
    {
      userId: user.id,
    },
    {
      jwtid: token.secret,
      expiresIn,
    }
  );

  response.status = 201; // Created
  response.body = {
    token: jwtToken,
    expiresIn: expiresIn * 1000, // convert to milliseconds
  };
}

export default compose([validation, handler]);
