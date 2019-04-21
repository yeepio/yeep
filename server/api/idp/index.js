import Router from 'koa-router';
import authenticate from './authenticate';
// import callback from './callback';
// import list from './list';

const router = Router();

// method signature: name, path, handler
// omit name if you want to hide this method from the api-docs
// router.post('/idp.list', list);
router.post('idp.authenticate', '/idp.authenticate', authenticate);
// router.get('/idp/:provider/callback', authenticate);

export default router;
