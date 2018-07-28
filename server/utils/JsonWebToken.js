import isString from 'lodash/isString';
import isInteger from 'lodash/isInteger';
import jwt from 'jsonwebtoken';
import Promise from 'bluebird';
import typeOf from 'typeof';

Promise.promisifyAll(jwt);

class JsonWebToken {
  /**
   * Creates new JsonWebToken instance with the specified properties.
   * @param {Object} props
   * @property {string} props.secretKey the secret key used to encrypt JSON web tokens.
   * @property {string} props.issuer the name of the JSON web token issuer, e.g. your company / organization.
   * @property {string} [props.algorithm=HS512] the encryption algorithm, defaults to "HS512" (i.e. SHA-512).
   * @property {number} [props.expiresIn=2419200] time in seconds a JSON web token is considered valid, defaults to 28 days.
   * @constructor
   */
  constructor(props) {
    const {
      secretKey,
      issuer,
      algorithm = 'HS512',
      expiresIn = 28 * 24 * 60 * 60, // 28 days (in seconds)
    } = props;

    if (!isString(secretKey)) {
      throw new TypeError(
        `Invalid secretKey property; expected string, received ${typeOf(secretKey)}`
      );
    }

    if (!isString(issuer)) {
      throw new TypeError(`Invalid issuer property; expected string, received ${typeOf(issuer)}`);
    }

    if (!isString(algorithm)) {
      throw new TypeError(
        `Invalid algorithm property; expected string, received ${typeOf(algorithm)}`
      );
    }

    if (!isInteger(expiresIn)) {
      throw new TypeError(
        `Invalid expiresIn property; expected integer, received ${typeOf(expiresIn)}`
      );
    }

    this.props = {
      issuer,
      algorithm,
      expiresIn,
      secretKey: Buffer.from(secretKey, 'utf8'),
    };
  }

  /**
   * Generates and returns a new JSON web token with the designated payload.
   * @param {Object} payload
   * @param {Object} [options]
   * @see {@link https://github.com/auth0/node-jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback} for further info on sign options.
   * @return {Promise<string>} a Bluebird promise resolving to a string.
   */
  sign(payload, options = {}) {
    const { secretKey, issuer, algorithm, expiresIn } = this.props;
    return jwt.signAsync(payload, secretKey, {
      issuer,
      algorithm,
      expiresIn,
      ...options,
    });
  }

  /**
   * Verifies whether the supplied JSON Web Token is valid and returns its contents.
   * @param {string} token the JSON Web Token.
   * @param {Object} [options]
   * @see {@link https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback} for further info on verify options.
   * @return {Promise<Object>} bluebird promise resolving to an Object.
   */
  verify(token, options = {}) {
    const { secretKey, issuer, algorithm, expiresIn } = this.props;
    return jwt.verifyAsync(token, secretKey, {
      issuer,
      algorithm,
      expiresIn,
      ignoreExpiration: false,
      ...options,
    });
  }

  /**
   * (Synchronous) Returns the decoded payload of the supplied JSON Web Token without verifying if the signature is valid.
   * @param {string} token the JSON Web Token.
   * @param {Object} options
   * @return {Object}
   * @see {@link https://github.com/auth0/node-jsonwebtoken#jwtdecodetoken--options} for further info on decode options.
   */
  decode(token, options = {}) {
    return jwt.decode(token, options);
  }
}

export default JsonWebToken;
