import Router from 'koa-router';
import createPermission from './create';
import deletePermission from './delete';
import getPermissionInfo from './info';
import updatePermission from './update';
import listPermissions from './list';

const router = Router();

// method signature: name, path, handler
// omit name if you want to hide this method from the api-docs
router.post('permission.create', '/v1/permission.create', createPermission);
router.post('permission.delete', '/v1/permission.delete', deletePermission);
router.post('permission.info', '/v1/permission.info', getPermissionInfo);
router.post('permission.update', '/v1/permission.update', updatePermission);
router.post('permission.list', '/v1/permission.list', listPermissions);

export default router;
