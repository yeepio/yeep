import Router from 'koa-router';
import ping from './ping';
import docs from './docs';
import batch from './batch';

const router = Router();

router.get('/ping', ping);
router.get('/docs', docs);
router.post('/batch', batch);

export default router;
