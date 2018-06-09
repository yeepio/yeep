import Router from 'koa-router';
import createSession from './create';
import getSessionInfo from './info';
import destroySession from './destroy';

const router = Router();

router.post('/v1/session.create', createSession);
router.post('/v1/session.info', getSessionInfo);
router.post('/v1/session.destroy', destroySession);

export default router;
