import Router from 'koa-router';
import issueToken from './issueToken';
import destroyToken from './destroyToken';
import refreshToken from './refreshToken';
import setCookie from './setCookie';
import destroyCookie from './destroyCookie';
import refreshCookie from './refreshCookie';

const router = Router();

// method signature: name, path, handler
// omit name if you want to hide this method from the api-docs
router.post('session.issueToken', '/session.issueToken', issueToken);
router.post('session.refreshToken', '/session.refreshToken', refreshToken);
router.post('session.destroyToken', '/session.destroyToken', destroyToken);
router.post('session.setCookie', '/session.setCookie', setCookie);
router.post('session.refreshCookie', '/session.refreshCookie', refreshCookie);
router.post('session.destroyCookie', '/session.destroyCookie', destroyCookie);

export default router;
