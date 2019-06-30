import jwt from 'jsonwebtoken';
import Promise from 'bluebird';
import omit from 'lodash/fp/omit';

Promise.promisifyAll(jwt);

export default jwt;
export const omitJwtProps = omit(['iat', 'exp', 'iss', 'jti']);
