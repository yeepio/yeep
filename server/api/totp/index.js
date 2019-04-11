import Router from 'koa-router';
import enroll from './enroll';
import activate from './activate';

const router = Router();

// method signature: name, path, handler
// omit name if you want to hide this method from the api-docs
router.post('totp.enroll', '/totp.enroll', enroll);
router.post('totp.activate', '/totp.activate', activate);

export default router;
