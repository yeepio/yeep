import Router from 'koa-router';
import ping from './ping';
import docs from './docs';

const router = Router();

router.get('/ping', ping);
router.get('/docs', docs);

export default router;
