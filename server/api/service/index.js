import Router from 'koa-router';
import ping from './ping';
import apidoc from './apidoc';

const router = Router();

router.get('/v1/ping', ping);
router.get('/v1/apidoc', apidoc);

export default router;
