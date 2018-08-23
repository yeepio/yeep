import Router from 'koa-router';
import createRole from './create';
import getRoleInfo from './info';
import deleteRole from './delete';

const router = Router();

router.post('/v1/role.create', createRole);
router.post('/v1/role.info', getRoleInfo);
router.post('/v1/role.delete', deleteRole);

export default router;
