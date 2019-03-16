import Router from 'koa-router';
import getFile from './getFile';

const router = Router();

// method signature: name, path, handler
// omit name if you want to hide this method from the api-docs
router.get('/media/:filename', getFile);

export default router;
