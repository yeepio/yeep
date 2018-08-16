import addSeconds from 'date-fns/add_seconds';
import { UserNotFoundError, InvalidCredentialsError } from '../../../constants/errors';

async function createSessionToken(db, jwt, { username, password }) {
  const UserModel = db.model('User');
  const CredentialsModel = db.model('Credentials');

  // retrieve user from db
  const users = await UserModel.aggregate([
    { $match: { username } },
    {
      $lookup: {
        from: 'credentials',
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$type', 'PASSWORD'] }, { $eq: ['$user', '$$userId'] }],
              },
            },
          },
        ],
        as: 'credentials',
      },
    },
    {
      $unwind: '$credentials',
    },
    {
      $project: {
        _id: 1,
        password: '$credentials.password',
        salt: '$credentials.salt',
        iterationCount: '$credentials.iterationCount',
      },
    },
  ]).exec();

  // make sure user exists
  if (users.length === 0) {
    throw new UserNotFoundError(`User "${username}" not found`);
  }

  const user = users[0];

  // verify password
  const digestedPassword = await CredentialsModel.digestPassword(
    password,
    user.salt.buffer,
    user.iterationCount
  );

  if (user.password.buffer.compare(digestedPassword) !== 0) {
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
      userId: user._id.toHexString(),
    },
    {
      jwtid: token.secret,
      expiresIn,
    }
  );

  return {
    id: token.id, // as hex string
    token: jwtToken,
    expiresIn: expiresIn * 1000, // convert to milliseconds
  };
}

export default createSessionToken;
