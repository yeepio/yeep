import Router from 'koa-router';
import ping from './ping';
import getOpenApi from './openapi';

const router = Router();

router.get('/v1/ping', ping);
router.get('/v1/openapi', getOpenApi);

export default router;
