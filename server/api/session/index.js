import Router from 'koa-router';
import createSession from './create';
import destroySession from './destroy';
import refreshSession from './refresh';
import setCookie from './setCookie';
import destroyCookie from './destroyCookie';
import refreshCookie from './refreshCookie';

const router = Router();

// method signature: name, path, handler
// omit name if you want to hide this method from the api-docs
router.post('session.create', '/session.create', createSession);
router.post('session.destroy', '/session.destroy', destroySession);
router.post('session.refresh', '/session.refresh', refreshSession);
router.post('session.setCookie', '/session.setCookie', setCookie);
router.post('session.refreshCookie', '/session.refreshCookie', refreshCookie);
router.post('session.destroyCookie', '/session.destroyCookie', destroyCookie);

export default router;
