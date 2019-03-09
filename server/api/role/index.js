import Router from 'koa-router';
import createRole from './create';
import getRoleInfo from './info';
import deleteRole from './delete';
import updateRole from './update';
import listRoles from './list';

const router = Router();

router.post('role.create', '/v1/role.create', createRole);
router.post('role.info', '/v1/role.info', getRoleInfo);
router.post('role.delete', '/v1/role.delete', deleteRole);
router.post('role.update', '/v1/role.update', updateRole);
router.post('role.list', '/v1/role.list', listRoles);

export default router;
