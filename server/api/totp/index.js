import Router from 'koa-router';
import generateSecret from './generateSecret';
import enroll from './enroll';

const router = Router();

// method signature: name, path, handler
// omit name if you want to hide this method from the api-docs
router.post('totp.generateSecret', '/totp.generateSecret', generateSecret);
router.post('totp.enroll', '/totp.enroll', enroll);

export default router;
