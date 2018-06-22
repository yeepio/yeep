import Router from 'koa-router';
import createPermission from './create';
import deletePermission from './delete';

const router = Router();

router.post('/v1/permission.create', createPermission);
router.post('/v1/permission.delete', deletePermission);

export default router;
