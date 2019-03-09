import Router from 'koa-router';
import createSession from './create';
import destroySession from './destroy';
import refreshSession from './refresh';

const router = Router();

router.post('session.create', '/v1/session.create', createSession);
router.post('session.destroy', '/v1/session.destroy', destroySession);
router.post('session.refresh', '/v1/session.refresh', refreshSession);

export default router;
