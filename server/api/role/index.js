import Router from 'koa-router';
import createRole from './create';
import getRoleInfo from './info';
import deleteRole from './delete';
import updateRole from './update';
import listRoles from './list';

const router = Router();

// method signature: name, path, handler
// omit name if you want to hide this method from the api-docs
router.post('role.create', '/role.create', createRole);
router.post('role.info', '/role.info', getRoleInfo);
router.post('role.delete', '/role.delete', deleteRole);
router.post('role.update', '/role.update', updateRole);
router.post('role.list', '/role.list', listRoles);

export default router;
