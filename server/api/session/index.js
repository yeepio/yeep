import Router from 'koa-router';
import createSession from './create';
import getSessionInfo from './info';

const router = Router();

router.post('/v1/session.create', createSession);
router.post('/v1/session.info', getSessionInfo);

export default router;
