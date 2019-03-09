import Router from 'koa-router';
import createOrg from './create';
import deleteOrg from './delete';
import addMember from './addMember';
import removeMember from './removeMember';

const router = Router();

router.post('org.create', '/v1/org.create', createOrg);
router.post('org.delete', '/v1/org.delete', deleteOrg);
router.post('org.addMember', '/v1/org.addMember', addMember);
router.post('org.removeMember', '/v1/org.removeMember', removeMember);

export default router;
