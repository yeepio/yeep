import Router from 'koa-router';
import createInvitation from './create';
import acceptInvitation from './accept';
import listInvitations from './list';

const router = Router();

// method signature: name, path, handler
// omit name if you want to hide this method from the api-docs
router.post('invitation.create', '/v1/invitation.create', createInvitation);
router.post('invitation.accept', '/v1/invitation.accept', acceptInvitation);
router.post('invitation.list', '/v1/invitation.list', listInvitations);

export default router;
