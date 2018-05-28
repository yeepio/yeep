import Router from 'koa-router';
import createUser from './create';

const router = Router();

router.post('/v1/user.create', createUser);

export default router;
