import Router from 'koa-router';
import health from './health';
import org from './org';

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

export default router;
