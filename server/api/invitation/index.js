import Router from 'koa-router';
import createInvitation from './create';

const router = Router();

router.post('/v1/invitation.create', createInvitation);

export default router;
