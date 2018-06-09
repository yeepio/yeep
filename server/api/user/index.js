import Router from 'koa-router';
import createUser from './create';
import deleteUser from './delete';

const router = Router();

router.post('/v1/user.create', createUser);
router.post('/v1/user.delete', deleteUser);

export default router;
