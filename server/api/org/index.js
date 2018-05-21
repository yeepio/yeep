import Router from 'koa-router';
import createOrg from './create';
import deleteOrg from './delete';

const router = Router();

router.post('/v1/org.create', createOrg);
router.post('/v1/org.delete', deleteOrg);

export default router;
