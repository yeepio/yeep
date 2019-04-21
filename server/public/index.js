import Router from 'koa-router';
import emailVerify from './emailVerify';

const router = Router();

router.get('/verify-email', emailVerify);

export default router;
