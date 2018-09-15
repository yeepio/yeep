import Router from 'koa-router';
import health from './health';
import org from './org';
import user from './user';
import session from './session';
import permission from './permission';
import role from './role';

const router = Router();

// create ctx.request.params alias to ctx.params
router.use(async (ctx, next) => {
  if (ctx.params) {
    ctx.request.params = ctx.params;
  }

  await next();
});

router.use('/api', health.routes(), health.allowedMethods());
router.use('/api', org.routes(), org.allowedMethods());
router.use('/api', user.routes(), user.allowedMethods());
router.use('/api', session.routes(), session.allowedMethods());
router.use('/api', permission.routes(), permission.allowedMethods());
router.use('/api', role.routes(), role.allowedMethods());

export default router;
