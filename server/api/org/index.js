import Router from 'koa-router';
import createOrg from './create';
import deleteOrg from './delete';
import listOrgs from './list';
import addMember from './addMember';
import removeMember from './removeMember';

const router = Router();

router.post('/v1/org.create', createOrg);
router.post('/v1/org.delete', deleteOrg);
router.post('/v1/org.list', listOrgs);
router.post('/v1/org.addMember', addMember);
router.post('/v1/org.removeMember', removeMember);

export default router;
