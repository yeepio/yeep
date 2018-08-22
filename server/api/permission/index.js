import Router from 'koa-router';
import createPermission from './create';
import deletePermission from './delete';
import getPermissionInfo from './info';
import updatePermission from './update';
import listPermissions from './list';

const router = Router();

router.post('/v1/permission.create', createPermission);
router.post('/v1/permission.delete', deletePermission);
router.post('/v1/permission.info', getPermissionInfo);
router.post('/v1/permission.update', updatePermission);
router.post('/v1/permission.list', listPermissions);

export default router;
