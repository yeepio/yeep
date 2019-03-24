import Router from 'koa-router';
import createSession from './create';
import destroySession from './destroy';
import refreshSession from './refresh';

const router = Router();

// method signature: name, path, handler
// omit name if you want to hide this method from the api-docs
router.post('session.create', '/session.create', createSession);
router.post('session.destroy', '/session.destroy', destroySession);
router.post('session.refresh', '/session.refresh', refreshSession);

export default router;
