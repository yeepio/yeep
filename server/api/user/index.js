import Router from 'koa-router';
import createUser from './create';
import deleteUser from './delete';
import getUserInfo from './info';
import assignPermission from './assignPermission';
import revokePermission from './revokePermission';

const router = Router();

router.post('/v1/user.create', createUser);
router.post('/v1/user.delete', deleteUser);
router.post('/v1/user.info', getUserInfo);
router.post('/v1/user.assignPermission', assignPermission);
router.post('/v1/user.revokePermission', revokePermission);

export default router;
