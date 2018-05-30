import Router from 'koa-router';
import createSession from './create';

const router = Router();

router.post('/v1/session.create', createSession);

export default router;
