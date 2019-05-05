import Router from 'koa-router';
import types from './types';
import authenticate from './authenticate';
// import callback from './callback';
// import list from './list';

const router = Router();

// method signature: name, path, handler
// omit name if you want to hide this method from the api-docs
router.post('idp.types', '/idp.types', types);
router.post('idp.authenticate', '/idp.authenticate', authenticate);
// router.get('/idp/:provider/callback', authenticate);

export default router;
