import Router from 'koa-router';
import createOrg from './create';
import deleteOrg from './delete';
import updateOrg from './update';
import listOrgs from './list';
import getOrgInfo from './info';
import addMember from './addMember';
import removeMember from './removeMember';

const router = Router();

// method signature: name, path, handler
// omit name if you want to hide this method from the api-docs
router.post('org.create', '/org.create', createOrg);
router.post('org.delete', '/org.delete', deleteOrg);
router.post('org.list', '/org.list', listOrgs);
router.post('org.info', '/org.info', getOrgInfo);
router.post('org.update', '/org.update', updateOrg);
router.post('org.addMember', '/org.addMember', addMember);
router.post('org.removeMember', '/org.removeMember', removeMember);

export default router;
