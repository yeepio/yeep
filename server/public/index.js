import Router from 'koa-router';
import email from './email';

const router = Router();

// create ctx.request.params alias to ctx.params
router.use(async (ctx, next) => {
  if (ctx.params) {
    ctx.request.params = ctx.params;
  }

  await next();
});

router.use(email.routes(), email.allowedMethods());

export default router;
