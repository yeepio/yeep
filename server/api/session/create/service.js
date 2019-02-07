import addSeconds from 'date-fns/add_seconds';
import isBefore from 'date-fns/is_before';
import { ObjectId } from 'mongodb';
import {
  UserNotFoundError,
  InvalidCredentialsError,
  UserDeactivatedError,
} from '../../../constants/errors';
import { getUserPermissions } from '../../user/info/service';

export const defaultScope = {
  permissions: false,
  profile: false,
};

const constructMatchQuery = (username, emailAddress) => {
  if (username) {
    return { username };
  }

  return {
    emails: { $elemMatch: { address: emailAddress } },
  };
};

export async function getUserByPasswordCredentials({ db }, { username, emailAddress, password }) {
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
        username: 1,
        fullName: 1,
        picture: 1,
        emails: 1,
        password: '$credentials.password',
        salt: '$credentials.salt',
        iterationCount: '$credentials.iterationCount',
        deactivatedAt: 1,
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

  return {
    id: user._id.toHexString(),
    username: user.username,
    fullName: user.fullName,
    picture: user.picture,
    emails: user.emails,
  };
}

export async function issueAccessAndRefreshTokens(
  { db, jwt, config },
  { user, scope = defaultScope }
) {
  const TokenModel = db.model('Token');
  const UserModel = db.model('User');
  const now = new Date();

  const authToken = await TokenModel.create({
    secret: TokenModel.generateSecret({ length: 24 }),
    type: 'AUTHENTICATION',
    payload: {},
    user: ObjectId(user.id),
    expiresAt: addSeconds(now, config.accessToken.lifetimeInSeconds),
  });

  // build accessToken payload
  const payload = {
    user: {
      id: user.id,
    },
  };

  // visit accessToken payload with user profile data
  if (scope.profile) {
    payload.user.username = user.username;
    payload.user.fullName = user.fullName;
    payload.user.picture = user.picture || undefined;
    payload.user.primaryEmail = UserModel.getPrimaryEmailAddress(user.emails);
  }

  // visit accessToken payload with user permissions
  if (scope.permissions) {
    const permissions = await getUserPermissions(db, { userId: user.id });
    payload.user.permissions = permissions.map((e) => {
      return {
        ...e,
        resourceId: e.resourceId || undefined, // remove resourceId if unspecified to save bandwidth
      };
    });
  }

  // issue access + refresh tokens
  const [accessToken, refreshToken] = await Promise.all([
    jwt.sign(payload, {
      jwtid: authToken.secret,
      expiresIn: config.accessToken.lifetimeInSeconds,
    }),
    TokenModel.create({
      secret: TokenModel.generateSecret({ length: 60 }),
      type: 'SESSION_REFRESH',
      payload: {
        accessTokenSecret: authToken.secret,
      },
      user: ObjectId(user.id),
      expiresAt: addSeconds(now, config.refreshToken.lifetimeInSeconds),
    }),
  ]);

  return {
    accessToken,
    refreshToken: refreshToken.secret,
  };
}

export default async function createSessionToken(
  ctx,
  { username, emailAddress, password, scope = defaultScope }
) {
  const user = await getUserByPasswordCredentials(ctx, {
    username,
    emailAddress,
    password,
  });
  return issueAccessAndRefreshTokens(ctx, { user, scope });
}
