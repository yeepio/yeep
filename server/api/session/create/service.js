import addSeconds from 'date-fns/add_seconds';
import { UserNotFoundError, InvalidCredentialsError } from '../../../constants/errors';

async function createSessionToken(db, jwt, { username, password }) {
  const UserModel = db.model('User');

  // retrieve user from db
  const user = await UserModel.findOne({
    username: username,
  });

  // make sure user exists
  if (!user) {
    throw new UserNotFoundError(`User "${username}" not found`);
  }

  // verify password
  const digestedPassword = await UserModel.digestPassword(password, user.salt, user.iterationCount);

  if (user.password.compare(digestedPassword) !== 0) {
    throw new InvalidCredentialsError('Invalid username or password credentials');
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

  return {
    id: token._id,
    token: jwtToken,
    expiresIn: expiresIn * 1000, // convert to milliseconds
  };
}

export default createSessionToken;
