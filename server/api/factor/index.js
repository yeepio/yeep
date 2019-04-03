import Router from 'koa-router';
import generateSecret from './generateSecret';
import enrollFactor from './enroll';

const router = Router();

// method signature: name, path, handler
// omit name if you want to hide this method from the api-docs
router.post('factor.generateSecret', '/factor.generateSecret', generateSecret);
router.post('factor.enroll', '/factor.enroll', enrollFactor);

export default router;
