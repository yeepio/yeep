import Router from 'koa-router';
import basic from './basic';

const router = Router();

// create ctx.request.params alias to ctx.params
router.use(async (ctx, next) => {
  if (ctx.params) {
    ctx.request.params = ctx.params;
  }

  await next();
});

router.use('/api', basic.routes(), basic.allowedMethods());

export default router;
