import addSeconds from 'date-fns/add_seconds';
import isBefore from 'date-fns/is_before';
import {
  UserNotFoundError,
  InvalidCredentialsError,
  UserDeactivatedError,
} from '../../../constants/errors';
import { getUserPermissions } from '../../user/info/service';

const constructMatchQuery = (username, emailAddress) => {
  if (username) {
    return { username };
  }

  return {
    emails: { $elemMatch: { address: emailAddress } },
  };
};

async function createSessionToken(
  db,
  jwt,
  { username, emailAddress, password, includePermissions }
) {
  const UserModel = db.model('User');
  const CredentialsModel = db.model('Credentials');

  const normalizedEmailAddress = emailAddress && UserModel.normalizeEmailAddress(emailAddress);

  // retrieve user from db
  const userRecords = await UserModel.aggregate([
    {
      $match: constructMatchQuery(username, normalizedEmailAddress),
    },
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
        deactivatedAt: 1,
        memberships: 1,
      },
    },
  ]).exec();

  // make sure user exists
  if (userRecords.length === 0) {
    throw new UserNotFoundError(`User "${username || emailAddress}" not found`);
  }

  const user = userRecords[0];

  // make sure user is active
  if (!!user.deactivatedAt && isBefore(user.deactivatedAt, new Date())) {
    throw new UserDeactivatedError(`User "${username || emailAddress}" is deactivated`);
  }

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
    user: user._id,
    expiresAt: addSeconds(new Date(), expiresIn),
  });

  // generate JWT token
  const payload = {
    id: user._id.toHexString(),
  };

  if (includePermissions) {
    const permissions = await getUserPermissions(db, {
      userId: payload.id,
    });
    payload.permissions = permissions.map((e) => {
      return {
        ...e,
        resourceId: e.resourceId || undefined, // remove resourceId if unspecified to save bandwidth
      };
    });
  }

  const authToken = await jwt.sign(payload, {
    jwtid: token.secret,
    expiresIn,
  });

  return {
    id: token.id, // as hex string
    token: authToken,
    expiresIn: expiresIn * 1000, // convert to milliseconds
  };
}

export default createSessionToken;
