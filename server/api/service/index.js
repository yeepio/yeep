import Router from 'koa-router';
import ping from './ping';
import getOpenApi from './openapi';

const router = Router();

router.get('/ping', ping);
router.get('/openapi', getOpenApi);

export default router;
