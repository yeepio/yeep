import Router from 'koa-router';
import createInvitation from './create';
import acceptInvitation from './accept';

const router = Router();

router.post('/v1/invitation.create', createInvitation);
router.post('/v1/invitation.accept', acceptInvitation);

export default router;
