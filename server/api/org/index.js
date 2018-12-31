import Router from 'koa-router';
import createOrg from './create';
import deleteOrg from './delete';
import addMember from './addMember';

const router = Router();

router.post('/v1/org.create', createOrg);
router.post('/v1/org.delete', deleteOrg);
router.post('/v1/org.addMember', addMember);

export default router;
