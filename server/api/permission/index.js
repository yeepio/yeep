import Router from 'koa-router';
import createPermission from './create';
import deletePermission from './delete';
import getPermissionInfo from './info';

const router = Router();

router.post('/v1/permission.create', createPermission);
router.post('/v1/permission.delete', deletePermission);
router.post('/v1/permission.info', getPermissionInfo);

export default router;
