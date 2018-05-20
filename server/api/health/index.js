import Router from 'koa-router';
import ping from './ping';

const router = Router();

router.get('/v1/ping', ping);

export default router;
