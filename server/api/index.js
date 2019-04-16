import Router from 'koa-router';
import service from './service';
import org from './org';
import user from './user';
import session from './session';
import permission from './permission';
import role from './role';
import media from './media';
import invitation from './invitation';
import totp from './totp';
import email from './email';

const router = Router();

// create ctx.request.params alias to ctx.params
router.use(async (ctx, next) => {
  if (ctx.params) {
    ctx.request.params = ctx.params;
  }

  await next();
});

router.use('/api', service.routes(), service.allowedMethods());
router.use('/api', org.routes(), org.allowedMethods());
router.use('/api', user.routes(), user.allowedMethods());
router.use('/api', session.routes(), session.allowedMethods());
router.use('/api', permission.routes(), permission.allowedMethods());
router.use('/api', role.routes(), role.allowedMethods());
router.use('/api', invitation.routes(), invitation.allowedMethods());
router.use('/api', totp.routes(), totp.allowedMethods());
router.use('/api', email.routes(), email.allowedMethods());
router.use(media.routes(), media.allowedMethods());

export default router;
