import Router from 'koa-router';
import createInvitation from './create';
import acceptInvitation from './accept';
import listInvitations from './list';

const router = Router();

router.post('/v1/invitation.create', createInvitation);
router.post('/v1/invitation.accept', acceptInvitation);
router.post('/v1/invitation.list', listInvitations);

export default router;
