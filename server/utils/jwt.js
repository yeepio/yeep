import jwt from 'jsonwebtoken';
import Promise from 'bluebird';

Promise.promisifyAll(jwt);

export default jwt;
