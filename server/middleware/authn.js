import Boom from 'boom';
import parseAuthnHeader from '../utils/parseAuthnHeader';

/**
 * Creates and returns authentication middleware with the specified options.
 * @param {Object} [options]
 * @param {boolean} [options.ignore=false] if true, user is allowed access resource without authentication
 * @returns {Function}
 */
function createAuthnMiddleware({ ignore = false } = {}) {
  return async ({ request, jwt, db }, next) => {
    // make sure authorization header exists
    if (!request.headers.authorization) {
      if (ignore) {
        // ignore option is true -> user is allowed to access resource without being authenticated
        await next();
        return; // break
      }

      throw Boom.notFound('Resource does not exist'); // lie with 404
    }

    // parse authorization header
    const { schema, token } = parseAuthnHeader(request.headers.authorization);

    // make sure authorization schema is valid
    if (schema !== 'Bearer') {
      throw Boom.unauthorized('Invalid authorization schema', 'Bearer', {
        realm: 'Yeep',
      });
    }

    // extract authorization payload
    let tokenSecret;
    let userId;
    let issuedAt;
    let expiresAt;

    try {
      const payload = await jwt.verify(token);
      tokenSecret = payload.jti;
      userId = payload.userId;
      issuedAt = new Date(payload.iat * 1000);
      expiresAt = new Date(payload.exp * 1000);
    } catch (err) {
      throw Boom.unauthorized('Invalid authorization token', 'Bearer', {
        realm: 'Yeep',
      });
    }

    // retrieve user info
    const TokenModel = db.model('Token');
    const records = await TokenModel.aggregate([
      { $match: { secret: tokenSecret } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $project: {
          'user._id': 1,
          'user.username': 1,
          'user.emails': 1,
          'user.fullName': 1,
          'user.picture': 1,
          // 'user.orgs': 1,
          // 'user.roles': 1,
          'user.createdAt': 1,
          'user.updatedAt': 1,
        },
      },
      {
        $unwind: '$user',
      },
    ]).exec();

    // make sure authorization token is active
    if (records.length === 0 || !records[0].user._id.equals(userId)) {
      throw Boom.unauthorized('Invalid authorization token', 'Bearer', {
        realm: 'Yeep',
      });
    }

    // augment request object with session data
    request.session = {
      token: {
        id: records[0]._id,
        issuedAt,
        expiresAt,
      },
      user: records[0].user,
    };

    await next();
  };
}

export default createAuthnMiddleware;
