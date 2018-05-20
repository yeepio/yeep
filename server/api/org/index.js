import Router from 'koa-router';
import create from './create';

const router = Router();

router.post('/v1/org.create', create);

export default router;
