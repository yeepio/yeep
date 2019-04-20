import Router from 'koa-router';
import enroll from './enroll';
import activate from './activate';
import eject from './eject';

const router = Router();

// method signature: name, path, handler
// omit name if you want to hide this method from the api-docs
router.post('totp.enroll', '/totp.enroll', enroll);
router.post('totp.activate', '/totp.activate', activate);
router.post('totp.eject', '/totp.eject', eject);

export default router;
