import Router from 'koa-router';
import verify from './verify';

const router = Router();

router.get('/verify-email', verify);

export default router;
