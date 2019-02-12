import Router from 'koa-router';
import createSession from './create';
import destroySession from './destroy';
import refreshSession from './refresh';

const router = Router();

router.post('/v1/session.create', createSession);
router.post('/v1/session.destroy', destroySession);
router.post('/v1/session.refresh', refreshSession);

export default router;
