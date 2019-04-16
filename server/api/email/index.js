import Router from 'koa-router';
import verify from './verify';

const router = Router();

// method signature: name, path, handler
// omit name if you want to hide this method from the api-docs
router.post('email.verify', '/email.verify', verify);

export default router;
