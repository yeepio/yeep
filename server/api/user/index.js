import Router from 'koa-router';
import createUser from './create';
import deleteUser from './delete';
import assignPermission from './assignPermission';

const router = Router();

router.post('/v1/user.create', createUser);
router.post('/v1/user.delete', deleteUser);
router.post('/v1/user.assignPermission', assignPermission);

export default router;
