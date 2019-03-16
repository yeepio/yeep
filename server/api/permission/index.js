import Router from 'koa-router';
import createPermission from './create';
import deletePermission from './delete';
import getPermissionInfo from './info';
import updatePermission from './update';
import listPermissions from './list';

const router = Router();

// method signature: name, path, handler
// omit name if you want to hide this method from the api-docs
router.post('permission.create', '/permission.create', createPermission);
router.post('permission.delete', '/permission.delete', deletePermission);
router.post('permission.info', '/permission.info', getPermissionInfo);
router.post('permission.update', '/permission.update', updatePermission);
router.post('permission.list', '/permission.list', listPermissions);

export default router;
